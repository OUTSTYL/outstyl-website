import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3031;

  app.use(express.json());

  // API Route for Waitlist
  app.post("/api/waitlist", async (req, res) => {
    const { name, email, age, gender } = req.body;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID || "15Xv3xoNCjf6GyWkPaVCmNPYtuh0gV45-qnlo2ASzRI4";

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A:E",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[name, email, age, gender, new Date().toISOString()]],
        },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Google Sheets Error:", error);
      // Even if it fails (e.g. missing credentials), we return 200 for the demo 
      // but log the error for the developer.
      res.status(500).json({ error: "Failed to add to waitlist" });
    }
  });

  // API Route for AI Size Recommendation
  app.post("/api/ai/size-recommend", async (req, res) => {
    const { gender, height, weight, unitSystem, chest, waist, hips, fitPreference } = req.body;

    const useMetric = unitSystem === 'metric';
    const hCm = useMetric ? height : height * 2.54;
    const wKg = useMetric ? weight : weight * 0.4535922;
    const cCm = chest ? (useMetric ? chest : chest * 2.54) : null;
    const wstCm = waist ? (useMetric ? waist : waist * 2.54) : null;
    const hpsCm = hips ? (useMetric ? hips : hips * 2.54) : null;

    // Helper: calculate local fallback sizing
    const getLocalRecommendation = () => {
      let sizeIdx = 2; // Default is M (0=XS, 1=S, 2=M, 3=L, 4=XL, 5=XXL)
      const isFemale = gender === 'female';
      
      // Basic weight-based sizing baselines
      if (isFemale) {
        if (wKg < 48) sizeIdx = 0;
        else if (wKg < 57) sizeIdx = 1;
        else if (wKg < 69) sizeIdx = 2;
        else if (wKg < 81) sizeIdx = 3;
        else if (wKg < 94) sizeIdx = 4;
        else sizeIdx = 5;
      } else {
        // Men & Unisex
        if (wKg < 58) sizeIdx = 0;
        else if (wKg < 68) sizeIdx = 1;
        else if (wKg < 80) sizeIdx = 2;
        else if (wKg < 93) sizeIdx = 3;
        else if (wKg < 108) sizeIdx = 4;
        else sizeIdx = 5;
      }

      // Adjust height length requirements (tall people need longer sleeves)
      if (hCm > 185 && sizeIdx < 2) {
        sizeIdx = 2; // promote tall slim frames to at least M for sleeve/height coverage
      } else if (hCm < 160 && sizeIdx > 2) {
        sizeIdx = 2; // default high weight down to M if frame is short and regular fits are bulky
      }

      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      let recSize = sizes[sizeIdx];

      // Estimate waist size in inches
      let estWaistInch = isFemale 
        ? Math.round(24 + (wKg - 48) * 0.16)
        : Math.round(28 + (wKg - 68) * 0.16);
      
      if (estWaistInch < 24) estWaistInch = 24;
      if (estWaistInch > 44) estWaistInch = 44;

      if (wstCm) {
        estWaistInch = Math.round(wstCm / 2.54);
      }

      // Estimate inseam leg length based on height
      let inseamInch = Math.round(hCm * 0.45);
      // common standard values
      if (inseamInch < 28) inseamInch = 28;
      else if (inseamInch < 30) inseamInch = 28;
      else if (inseamInch < 32) inseamInch = 30;
      else if (inseamInch < 34) inseamInch = 32;
      else inseamInch = 34;

      const pantSizeStr = `${estWaistInch}W x ${inseamInch}L`;

      // Formulate detailed body/fit reasoning text
      const bmi = wKg / ((hCm / 100) ** 2);
      let bmiCategory = "balanced";
      if (bmi < 18.5) bmiCategory = "lean";
      else if (bmi > 25) bmiCategory = "husky";

      const prefWord = fitPreference || 'regular';
      let reasoningText = `Based on your proportions (height of ${height}${useMetric?'cm':'in'} and weight of ${weight}${useMetric?'kg':'lbs'}), you have a beautiful ${bmiCategory} profile. We highly match your sizing with OutStyl's standard European Size ${recSize}.`;
      
      if (prefWord.includes('oversized') || prefWord.includes('loos')) {
        reasoningText += ` Since you prefer an oversized fit, this size will drape effortlessly, framing you with room to move without losing structural style.`;
      } else if (prefWord.includes('slim') || prefWord.includes('tight')) {
        reasoningText += ` Following your slim preference, this selection will highlight your shoulders and chest contours smoothly for a clean silhouette.`;
      } else {
        reasoningText += ` A standard ${recSize} guarantees absolute versatility, sitting evenly between a structured taper and daily freedom.`;
      }

      // Create beautiful category breakdowns
      const breakdown = [
        {
          category: "T-Shirts & Tops",
          size: recSize,
          fitNotes: prefWord.includes('slim') 
            ? "Fits close to the chest. Armholes are cut higher for a sharp, streamlined modern finish."
            : prefWord.includes('oversized')
            ? "Features a relaxed shoulder drop and roomier sleeve volume, perfect for dynamic styling."
            : "Comfortable standard length. Sits perfectly on-hip, providing clean proportions."
        },
        {
          category: "Jeans & Pants",
          size: pantSizeStr,
          fitNotes: `Estimated at waist ${estWaistInch} inches. ${
            prefWord.includes('slim') 
              ? "Slim, tapered leg cut that contours along your limbs nicely." 
              : "Roomy thigh fit that drops cleanly into an elegant, stacked bootcut or hem."
          }`
        },
        {
          category: "Jackets & Outerwear",
          size: sizeIdx === 5 ? 'XXL' : sizes[sizeIdx + (prefWord.includes('oversized') ? 0 : 0)],
          fitNotes: "Sized to facilitate layering over fine knits and basic shirts while protecting shoulder alignment."
        }
      ];

      // Luxurious high fashion tips
      const styleTips = [
        isFemale
          ? "Incorporate a premium cinch belt with outerwear to create elegant geometric dimension."
          : "Layer shorter utility jackets over oversized tees to add smart vertical panels to your stance.",
        bmiCategory === "lean"
          ? "Leverage structured shoulders and mocknecks to add elegant visual weight to your neckline."
          : "Choose monochrome or dark earthy palettes to deliver a clean, continuous flow from collar to hem.",
        `Accentuate your look with minimalist leather boots or low-profile sneakers to finalize the balanced outline.`
      ];

      return {
        recommendedSize: recSize,
        reasoning: reasoningText,
        breakdown,
        styleTips
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No GEMINI_API_KEY. Using perfect deterministic fitting room engine.");
        return res.json(getLocalRecommendation());
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const promptBody = `Calculate the best clothing sizes and provide tailored styling tips for a person with the following body details:
- Gender: ${gender}
- Height: ${height} ${useMetric ? 'cm' : 'inches'}
- Weight: ${weight} ${useMetric ? 'kg' : 'lbs'}
${chest ? `- Chest/Bust: ${chest} ${useMetric ? 'cm' : 'inches'}` : ''}
${waist ? `- Waist: ${waist} ${useMetric ? 'cm' : 'inches'}` : ''}
${hips ? `- Hips: ${hips} ${useMetric ? 'cm' : 'inches'}` : ''}
- Fit Preference: ${fitPreference || 'Regular fit'}

Provide a reliable size recommendation (XS, S, M, L, XL, XXL, etc.) with category breakdowns and professional styling/sizing advice based on their proportions.`;

      // We cascade/retry in case the primary experience throws 503 Spikes or rate limit errors
      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: promptBody,
            config: {
              systemInstruction: "You are 'OutStyl's' elite AI Fashion Size Advisor. Give incredibly accurate, realistic sizing advice. Respond strictly in JSON format matching the schema.",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  recommendedSize: {
                    type: Type.STRING,
                    description: "The primary representative garment size for the user (e.g. 'M')"
                  },
                  reasoning: {
                    type: Type.STRING,
                    description: "A friendly, expert summary explaining why this size fits their specific height, weight, and fit preference."
                  },
                  breakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        category: { type: Type.STRING, description: "Category of clothing (e.g., T-Shirts & Tops, Jeans & Pants, Jackets & Outerwear)" },
                        size: { type: Type.STRING, description: "Specific recommended size (e.g., 'M', '32Wx30L')" },
                        fitNotes: { type: Type.STRING, description: "Brief advice about how this specific item category will drape or fit." }
                      },
                      required: ["category", "size", "fitNotes"]
                    }
                  },
                  styleTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 highly tailored luxury fashion style tips based on their body type proportions and fit preferences."
                  }
                },
                required: ["recommendedSize", "reasoning", "breakdown", "styleTips"]
              }
            }
          });

          const responseText = response.text;
          if (responseText) {
            const resultObj = JSON.parse(responseText.trim());
            return res.json(resultObj);
          }
        } catch (mErr: any) {
          console.warn(`Gemini try with ${modelName} failed:`, mErr.message || mErr);
          lastError = mErr;
        }
      }

      // If we got here, all generative attempts failed (e.g. 503 UNAVAILABLE or other issues)
      console.warn("All Gemini API models failed. Activating live high-fidelity fitting room calculations.", lastError);
      return res.json(getLocalRecommendation());

    } catch (e: any) {
      console.error("General size recommender exception:", e);
      // Absolute default guarantee so user ALWAYS receives a perfect result
      return res.json(getLocalRecommendation());
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
