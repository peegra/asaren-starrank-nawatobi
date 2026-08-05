import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

async function addSampleData() {
  const collections = ["players", "missions", "achievements"] as const;

  for (const name of collections) {
    const snap = await getDocs(collection(db, name));
    await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
  }

  await addDoc(collection(db, "players"), {
    playerCode: "P001",
    playerName: "Player1",
    grade: "中3",
    comment: "今日もがんばる",
    photoUrl: ""
  });

  await addDoc(collection(db, "missions"), {
    missionCode: "M001",
    missionName: "頭リフティング",
    content: "ゴールドは20回、シルバーは10回、ブロンズは5回"
  });

  await addDoc(collection(db, "achievements"), {
    playerCode: "P001",
    missionCode: "M001",
    starType: "bronze",
    achievedAt: new Date()
  });

  console.log("Seed complete: 1 player, 1 mission, 1 achievement");
}

addSampleData();