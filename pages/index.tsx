import { useUserPassportContext } from "../context/PassportContext";

export default function Home() {
  const { signIn } = useUserPassportContext();
  return (
    <main>
      <button onClick={signIn}>Signin</button>
      <div>home</div>
    </main>
  );
}
