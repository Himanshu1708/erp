// import React from "react";
// import GridShape from "../../components/common/GridShape";
// import { Link } from "react-router";
// import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

//  const AuthLayout = ({children}) => {
//   return (
//     <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
//       <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
//         {children}
//         <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
//           <div className="relative flex items-center justify-center z-1">
//             {/* <!-- ===== Common Grid Shape Start ===== --> */}
//             <GridShape />
//             <div className="flex flex-col items-center max-w-xs">
//               <Link to="/" className="block mb-4">
//                 <img
//                   width={231}
//                   height={48}
//                   src="/kstar-logo.png"
//                   alt="Logo"
//                   className="bg-white"
//                 />
//               </Link>
//               <p className="text-center text-white dark:text-white/60">
//                 Construction HRM, CRM, ERP
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
//           <ThemeTogglerTwo />
//         </div>
//       </div>
//     </div>
//   );
// }
// export default AuthLayout

import React, { useEffect } from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import AOS from "aos";
import "aos/dist/aos.css";

const AuthLayout = ({ children }) => {

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: "ease-in-out",
      once: true,
    });
  }, []);

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row sm:p-0">

        {/* LEFT SIDE (FORM) */}
        {children}

        {/* RIGHT SIDE (BRAND SECTION) */}
        <div
          className="items-center hidden w-full h-full lg:w-1/2 lg:grid"
          style={{
            background: "linear-gradient(135deg, #eaf4ff 0%, #eaf4ff 100%)",
          }}
        >
          <div className="relative flex items-center justify-center z-1">

            {/* Grid Background */}
            <GridShape />

            <div
              className="flex flex-col items-center max-w-xs"
              data-aos="zoom-in"
            >
              <Link to="/" className="block mb-6">
                <img
                  width={620}
                  height={98}
                  src="http://csms.linksoft.in/csms/images/tagor.jpeg"
                  alt="Logo"
                  className="bg-white p-3 rounded-xl shadow-md"
                />
              </Link>

              {/* <p
                className="text-center text-gray-700 font-medium"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Construction HRM, CRM & ERP Solutions
              </p> */}
            </div>
          </div>
        </div>

        {/* THEME TOGGLER */}
        {/* <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div> */}

      </div>
    </div>
  );
};

export default AuthLayout;
