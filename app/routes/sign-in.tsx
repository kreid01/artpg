import { SignIn}  from "@clerk/react-router";

export default function SignInPage() {
  return (
    <div className="flex items-center w-screen justify-center h-screen">
      <div className="ml-40">
        <SignIn />
      </div>
    </div>
  );
}
