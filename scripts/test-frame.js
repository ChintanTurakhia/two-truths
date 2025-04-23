// Simple script to test the frames API endpoint
import fetch from "node-fetch";

async function testFrameAPI() {
  try {
    const response = await fetch("http://localhost:3000/api/frames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Simplified frame message format for testing
        isValid: true,
        button: 1,
        state: Buffer.from(JSON.stringify({ currentView: "welcome" })).toString(
          "base64"
        ),
        fid: 12345,
        username: "testuser",
        inputText: "",
      }),
    });

    const html = await response.text();
    console.log("Response status:", response.status);
    console.log("Response HTML (first 500 chars):");
    console.log(html.substring(0, 500) + "...");
  } catch (error) {
    console.error("Error testing frame API:", error);
  }
}

testFrameAPI();
