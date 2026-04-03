// components/layout/PageWrapper.jsx
import Footer from "./Footer";

const PageWrapper = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageWrapper;

// Usage in any component:
// import PageWrapper from "../components/layout/PageWrapper";
//
// const MyPage = () => {
//   return (
//     <PageWrapper>
//       <div>Your page content</div>
//     </PageWrapper>
//   );
// };