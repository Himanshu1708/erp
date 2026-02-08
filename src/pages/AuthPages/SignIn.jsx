import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

const SignIn = () => {
   
  return (
    <>
      <PageMeta
        title="Sign In Dashboard"
        description="Sign In Dashboard"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
export default SignIn
