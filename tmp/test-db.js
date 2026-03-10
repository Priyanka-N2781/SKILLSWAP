import { createClient } from "@libsql/client";

const url = "https://skill-swap-db-priyanka-n2781.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMwNzE1NzQsImlkIjoiMDE5Y2NlNWMtODMwMS03YzA5LTkwY2ItOGM1OTNmODRkNjk1IiwicmlkIjoiMTFjNTJkMDUtMTlmNy00OGM2LWI0NTgtZmE0MTQxNWFiOGE4In0.e3PO2LOUTx07KUc51uyRP9vz9uctgcfwHnlUm_FbzoFEHHHF9BUQhWktxUoFJSQNa8EaWjMCyntDvDMlb9qQBA";

const client = createClient({ url, authToken });

async function test() {
  try {
    console.log("Testing connection to:", url);
    const rs = await client.execute("SELECT 1");
    console.log("SUCCESS! Result:", rs.rows);
  } catch (err) {
    console.error("FAILURE! Error details:", JSON.stringify(err, null, 2));
    if (err.cause) {
      console.error("Cause:", err.cause);
    }
  }
}

test();
