// // import { useCallback, useEffect, useRef, useState } from "react";
// // import { Link, useLocation } from "react-router-dom";

// // // Assume these icons are imported from an icon library
// // // import { BoxCubeIcon, CalenderIcon, ChevronDownIcon, GridIcon, HorizontaLDots, ListIcon, PageIcon, PieChartIcon, PlugInIcon, TableIcon, UserCircleIcon } from "../icons";
// // import { useSidebar } from "../context/SidebarContext";
// // import SidebarWidget from "./SidebarWidget";
// // import { CiGrid41, CiCalendar, CiViewList,CiViewTable } from "react-icons/ci";
// // import { IoIosArrowUp } from "react-icons/io";
// // import { HiOutlineUserCircle } from "react-icons/hi2";
// // import { VscCopy } from "react-icons/vsc";




// // const navItems = [
// //   {
// //     icon: <CiGrid41 />,
// //     name: "Dashboard",
// //     subItems: [{ name: "Home", path: "/", pro: false }],
// //   },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "User Management",
// //     subItems: [{ name: "Users", path: "/user-tables", pro: false }, { name: "Roles", path: "/basic-tables", pro: false }],
// //   },
// //   // {
// //   //   icon: <CiCalendar />,
// //   //   name: "Calendar",
// //   //   path: "/calendar",
// //   // },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "User Profile",
// //     path: "/profile",
// //   },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "Vendor Management",
// //     subItems: [{ name: "Vendor", path: "/vendor-tables", pro: false }, { name: "Roles", path: "/basic-tables", pro: false }],
// //   },
// //   {
// //     name: "Forms",
// //     icon: <CiViewList />,
// //     subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
// //   },
// //   {
// //     name: "Tables",
// //     icon: <CiViewTable />,
// //     subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
// //   },
// //   {
// //     name: "Pages",
// //     icon: <VscCopy />,
// //     subItems: [
// //       { name: "Blank Page", path: "/blank", pro: false },
// //       { name: "404 Error", path: "/error-404", pro: false },
// //     ],
// //   },
// // ];

// // const othersItems = [
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "Charts",
// //     subItems: [
// //       { name: "Line Chart", path: "/line-chart", pro: false },
// //       { name: "Bar Chart", path: "/bar-chart", pro: false },
// //     ],
// //   },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "UI Elements",
// //     subItems: [
// //       { name: "Alerts", path: "/alerts", pro: false },
// //       { name: "Avatar", path: "/avatars", pro: false },
// //       { name: "Badge", path: "/badge", pro: false },
// //       { name: "Buttons", path: "/buttons", pro: false },
// //       { name: "Images", path: "/images", pro: false },
// //       { name: "Videos", path: "/videos", pro: false },
// //     ],
// //   },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "Authentication",
// //     subItems: [
// //       { name: "Sign In", path: "/signin", pro: false },
// //       { name: "Sign Up", path: "/signup", pro: false },
// //     ],
// //   },
// // ];

// // const AppSidebar = () => {
// //   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
// //   const location = useLocation();

// //   const [openSubmenu, setOpenSubmenu] = useState(null);
// //   const [subMenuHeight, setSubMenuHeight] = useState({});
// //   const subMenuRefs = useRef({});

// //   // const isActive = (path: string) => location.pathname === path;
// //   const isActive = useCallback(
// //     (path) => location.pathname === path,
// //     [location.pathname]
// //   );

// //   useEffect(() => {
// //     let submenuMatched = false;
// //     ["main", "others"].forEach((menuType) => {
// //       const items = menuType === "main" ? navItems : othersItems;
// //       items.forEach((nav, index) => {
// //         if (nav.subItems) {
// //           nav.subItems.forEach((subItem) => {
// //             if (isActive(subItem.path)) {
// //               setOpenSubmenu({
// //                 menuType,
// //                 index,
// //               });
// //               submenuMatched = true;
// //             }
// //           });
// //         }
// //       });
// //     });

// //     if (!submenuMatched) {
// //       setOpenSubmenu(null);
// //     }
// //   }, [location, isActive]);

// //   useEffect(() => {
// //     if (openSubmenu !== null) {
// //       const key = `${openSubmenu.type}-${openSubmenu.index}`;
// //       if (subMenuRefs.current[key]) {
// //         setSubMenuHeight((prevHeights) => ({
// //           ...prevHeights,
// //           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
// //         }));
// //       }
// //     }
// //   }, [openSubmenu]);

// //   const handleSubmenuToggle = (index, menuType) => {
// //     setOpenSubmenu((prevOpenSubmenu) => {
// //       if (
// //         prevOpenSubmenu &&
// //         prevOpenSubmenu.type === menuType &&
// //         prevOpenSubmenu.index === index
// //       ) {
// //         return null;
// //       }
// //       return { type: menuType, index };
// //     });
// //   };

// //   const renderMenuItems = (items, menuType) => (
// //     <ul className="flex flex-col gap-4">
// //       {items.map((nav, index) => (
// //         <li key={nav.name}>
// //           {nav.subItems ? (
// //             <button
// //               onClick={() => handleSubmenuToggle(index, menuType)}
// //               className={`menu-item group ${
// //                 openSubmenu?.type === menuType && openSubmenu?.index === index
// //                   ? "menu-item-active"
// //                   : "menu-item-inactive"
// //               } cursor-pointer ${
// //                 !isExpanded && !isHovered
// //                   ? "lg:justify-center"
// //                   : "lg:justify-start"
// //               }`}
// //             >
// //               <span
// //                 className={`menu-item-icon-size  ${
// //                   openSubmenu?.type === menuType && openSubmenu?.index === index
// //                     ? "menu-item-icon-active"
// //                     : "menu-item-icon-inactive"
// //                 }`}
// //               >
// //                 {nav.icon}
// //               </span>
// //               {(isExpanded || isHovered || isMobileOpen) && (
// //                 <span className="menu-item-text">{nav.name}</span>
// //               )}
// //               {(isExpanded || isHovered || isMobileOpen) && (
// //                 <IoIosArrowUp
// //                   className={`ml-auto w-5 h-5 transition-transform duration-200 ${
// //                     openSubmenu?.type === menuType &&
// //                     openSubmenu?.index === index
// //                       ? "rotate-180 text-brand-500"
// //                       : ""
// //                   }`}
// //                 />
// //               )}
// //             </button>
// //           ) : (
// //             nav.path && (
// //               <Link
// //                 to={nav.path}
// //                 className={`menu-item group ${
// //                   isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
// //                 }`}
// //               >
// //                 <span
// //                   className={`menu-item-icon-size ${
// //                     isActive(nav.path)
// //                       ? "menu-item-icon-active"
// //                       : "menu-item-icon-inactive"
// //                   }`}
// //                 >
// //                   {/* {nav.icon} */}
// //                 </span>
// //                 {(isExpanded || isHovered || isMobileOpen) && (
// //                   <span className="menu-item-text">{nav.name}</span>
// //                 )}
// //               </Link>
// //             )
// //           )}
// //           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
// //             <div
// //               ref={(el) => {
// //                 subMenuRefs.current[`${menuType}-${index}`] = el;
// //               }}
// //               className="overflow-hidden transition-all duration-300"
// //               style={{
// //                 height:
// //                   openSubmenu?.type === menuType && openSubmenu?.index === index
// //                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
// //                     : "0px",
// //               }}
// //             >
// //               <ul className="mt-2 space-y-1 ml-9">
// //                 {nav.subItems.map((subItem) => (
// //                   <li key={subItem.name}>
// //                     <Link
// //                       to={subItem.path}
// //                       className={`menu-dropdown-item ${
// //                         isActive(subItem.path)
// //                           ? "menu-dropdown-item-active"
// //                           : "menu-dropdown-item-inactive"
// //                       }`}
// //                     >
// //                       {subItem.name}
// //                       <span className="flex items-center gap-1 ml-auto">
// //                         {subItem.new && (
// //                           <span
// //                             className={`ml-auto ${
// //                               isActive(subItem.path)
// //                                 ? "menu-dropdown-badge-active"
// //                                 : "menu-dropdown-badge-inactive"
// //                             } menu-dropdown-badge`}
// //                           >
// //                             new
// //                           </span>
// //                         )}
// //                         {subItem.pro && (
// //                           <span
// //                             className={`ml-auto ${
// //                               isActive(subItem.path)
// //                                 ? "menu-dropdown-badge-active"
// //                                 : "menu-dropdown-badge-inactive"
// //                             } menu-dropdown-badge`}
// //                           >
// //                             pro
// //                           </span>
// //                         )}
// //                       </span>
// //                     </Link>
// //                   </li>
// //                 ))}
// //               </ul>
// //             </div>
// //           )}
// //         </li>
// //       ))}
// //     </ul>
// //   );

// //   return (
// //    <aside
// //   style={{
// //     background: "linear-gradient(180deg, #437dc3ff 0%, #437dc3ff 100%)",
// //   }}
// //   className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 

// //           isExpanded || isMobileOpen
// //             ? "w-[290px]"
// //             : isHovered
// //             ? "w-[290px]"
// //             : "w-[90px]"
// //         }
// //         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
// //         lg:translate-x-0`}
// //       onMouseEnter={() => !isExpanded && setIsHovered(true)}
// //       onMouseLeave={() => setIsHovered(false)}
// //     >
// //       <div
// //         className={`py-8 flex ${
// //           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
// //         }`}
// //       >
// //         <Link to="/">
// //           {isExpanded || isHovered || isMobileOpen ? (
// //             <>
// //               <img
// //                 className="dark:hidden"
// //                 src="/kstar-logo.png"
// //                 alt="Logo"
// //                 width={150}
// //                 height={40}
// //               />
// //               <img
// //                 className="hidden dark:block"
// //                 src="/kstar-logo.png"
// //                 alt="Logo"
// //                 width={150}
// //                 height={40}
// //               />
// //             </>
// //           ) : (
// //             // <img
// //             //   src="/images/logo/logo-icon.svg"
// //             //   alt="Logo"
// //             //   width={32}
// //             //   height={32}
// //             // />
// //              <img
// //                 className="dark:hidden"
// //                 src="/kstar-logo.png"
// //                 alt="Logo"
// //                 width={150}
// //                 height={40}
// //               />
// //           )}
// //         </Link>
// //       </div>
// //       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
// //         <nav className="mb-6">
// //           <div className="flex flex-col gap-4">
// //             <div>
// //               <h2
// //                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
// //                   !isExpanded && !isHovered
// //                     ? "lg:justify-center"
// //                     : "justify-start"
// //                 }`}
// //               >
// //                 {isExpanded || isHovered || isMobileOpen ? (
// //                   "Menu"
// //                 ) : (
// //                   // <HorizontaLDots className="size-6" />
// //                   <p>hello</p>
// //                 )}
// //               </h2>
// //               {renderMenuItems(navItems, "main")}
// //             </div>
// //             <div className="">
// //               <h2
// //                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
// //                   !isExpanded && !isHovered
// //                     ? "lg:justify-center"
// //                     : "justify-start"
// //                 }`}
// //               >
// //                 {isExpanded || isHovered || isMobileOpen ? (
// //                   "Others"
// //                 ) : (
// //                   // <HorizontaLDots />
// //                   <p>hello</p>
// //                 )}
// //               </h2>
// //               {renderMenuItems(othersItems, "others")}
// //             </div>
// //           </div>
// //         </nav>
// //         {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
// //       </div>
// //     </aside>
// //   );
// // };

// // export default AppSidebar;


// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
// import { CiGrid41, CiCalendar, CiViewList, CiViewTable } from "react-icons/ci";
// import { IoIosArrowUp } from "react-icons/io";
// import { HiOutlineUserCircle } from "react-icons/hi2";
// import { VscCopy } from "react-icons/vsc";

// const navItems = [
//   {
//     icon: <CiGrid41 />,
//     name: "Dashboard",
//     subItems: [{ name: "Home", path: "/", pro: false }],
//   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "User Management",
//     subItems: [{ name: "Users", path: "/user-tables", pro: false }, { name: "Roles", path: "/basic-tables", pro: false }],
//   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "User Profile",
//     path: "/profile",
//   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "Vendor Management",
//     subItems: [{ name: "Vendor", path: "/vendor-tables", pro: false }, { name: "Roles", path: "/basic-tables", pro: false }],
//   },
//   {
//     name: "Forms",
//     icon: <CiViewList />,
//     subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
//   },
//   {
//     name: "Tables",
//     icon: <CiViewTable />,
//     subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
//   },
//   {
//     name: "Pages",
//     icon: <VscCopy />,
//     subItems: [
//       { name: "Blank Page", path: "/blank", pro: false },
//       { name: "404 Error", path: "/error-404", pro: false },
//     ],
//   },
// ];

// const othersItems = [
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "Charts",
//     subItems: [
//       { name: "Line Chart", path: "/line-chart", pro: false },
//       { name: "Bar Chart", path: "/bar-chart", pro: false },
//     ],
//   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "UI Elements",
//     subItems: [
//       { name: "Alerts", path: "/alerts", pro: false },
//       { name: "Avatar", path: "/avatars", pro: false },
//       { name: "Badge", path: "/badge", pro: false },
//       { name: "Buttons", path: "/buttons", pro: false },
//       { name: "Images", path: "/images", pro: false },
//       { name: "Videos", path: "/videos", pro: false },
//     ],
//   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "Authentication",
//     subItems: [
//       { name: "Sign In", path: "/signin", pro: false },
//       { name: "Sign Up", path: "/signup", pro: false },
//     ],
//   },
// ];

// const AppSidebar = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();

//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [subMenuHeight, setSubMenuHeight] = useState({});
//   const subMenuRefs = useRef({});

//   const isActive = useCallback(
//     (path) => location.pathname === path,
//     [location.pathname]
//   );

//   useEffect(() => {
//     let submenuMatched = false;
//     ["main", "others"].forEach((menuType) => {
//       const items = menuType === "main" ? navItems : othersItems;
//       items.forEach((nav, index) => {
//         if (nav.subItems) {
//           nav.subItems.forEach((subItem) => {
//             if (isActive(subItem.path)) {
//               setOpenSubmenu({
//                 menuType,
//                 index,
//               });
//               submenuMatched = true;
//             }
//           });
//         }
//       });
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [location, isActive]);

//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `${openSubmenu.type}-${openSubmenu.index}`;
//       if (subMenuRefs.current[key]) {
//         setSubMenuHeight((prevHeights) => ({
//           ...prevHeights,
//           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (index, menuType) => {
//     setOpenSubmenu((prevOpenSubmenu) => {
//       if (
//         prevOpenSubmenu &&
//         prevOpenSubmenu.type === menuType &&
//         prevOpenSubmenu.index === index
//       ) {
//         return null;
//       }
//       return { type: menuType, index };
//     });
//   };

//   const renderMenuItems = (items, menuType) => (
//     <ul className="flex flex-col gap-4">
//       {items.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index, menuType)}
//               className={`menu-item group ${
//                 openSubmenu?.type === menuType && openSubmenu?.index === index
//                   ? "menu-item-active"
//                   : "menu-item-inactive"
//               } cursor-pointer ${
//                 !isExpanded && !isHovered
//                   ? "lg:justify-center"
//                   : "lg:justify-start"
//               }`}
//             >
//               <span
//                 className={`menu-item-icon-size  ${
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? "menu-item-icon-active"
//                     : "menu-item-icon-inactive"
//                 } text-white`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <span className="menu-item-text text-white">{nav.name}</span>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <IoIosArrowUp
//                   className={`ml-auto w-5 h-5 transition-transform duration-200 text-white ${
//                     openSubmenu?.type === menuType &&
//                     openSubmenu?.index === index
//                       ? "rotate-180"
//                       : ""
//                   }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`menu-item group ${
//                   isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                 }`}
//               >
//                 <span
//                   className={`menu-item-icon-size ${
//                     isActive(nav.path)
//                       ? "menu-item-icon-active"
//                       : "menu-item-icon-inactive"
//                   } text-white`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <span className="menu-item-text text-white">{nav.name}</span>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`${menuType}-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 space-y-1 ml-9">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       to={subItem.path}
//                       className={`menu-dropdown-item ${
//                         isActive(subItem.path)
//                           ? "menu-dropdown-item-active"
//                           : "menu-dropdown-item-inactive"
//                       } text-white`}
//                     >
//                       {subItem.name}
//                       <span className="flex items-center gap-1 ml-auto">
//                         {subItem.new && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active"
//                                 : "menu-dropdown-badge-inactive"
//                             } menu-dropdown-badge text-white`}
//                           >
//                             new
//                           </span>
//                         )}
//                         {subItem.pro && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active"
//                                 : "menu-dropdown-badge-inactive"
//                             } menu-dropdown-badge text-white`}
//                           >
//                             pro
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       style={{
//         background: "linear-gradient(180deg, #437dc3ff 0%, #437dc3ff 100%)",
//       }}
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-blue-800 

//           ${isExpanded || isMobileOpen
//             ? "w-[290px]"
//             : isHovered
//             ? "w-[290px]"
//             : "w-[90px]"
//         }
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`py-8 flex ${
//           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//         }`}
//       >
//         <Link to="/">
//           {isExpanded || isHovered || isMobileOpen ? (
//             <>
//               <img
//                 className="dark:hidden"
//                 src="/kstar-logo.png"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//               <img
//                 className="hidden dark:block"
//                 src="/kstar-logo.png"
//                 alt="Logo"
//                 width={150}
//                 height={40}
//               />
//             </>
//           ) : (
//             <img
//               className="dark:hidden"
//               src="/kstar-logo.png"
//               alt="Logo"
//               width={150}
//               height={40}
//             />
//           )}
//         </Link>
//       </div>
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-blue-100 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Menu"
//                 ) : (
//                   <p className="text-blue-100">M</p>
//                 )}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>
//             <div className="">
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-blue-100 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Others"
//                 ) : (
//                   <p className="text-blue-100">O</p>
//                 )}
//               </h2>
//               {renderMenuItems(othersItems, "others")}
//             </div>
//           </div>
//         </nav>
//         {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;

// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
// import { CiGrid41, CiCalendar, CiViewList, CiViewTable } from "react-icons/ci";
// import { IoIosArrowUp } from "react-icons/io";
// import { HiOutlineUserCircle } from "react-icons/hi2";
// import { VscCopy } from "react-icons/vsc";

// const navItems = [
//   {
//     icon: <CiGrid41 />,
//     name: "Dashboard",
//     subItems: [{ name: "Home", path: "/", pro: false }],
//   },
//   // {
//   //   icon: <HiOutlineUserCircle />,
//   //   name: "User Management",
//   //   subItems: [{ name: "Users", path: "/user-tables", pro: false },{ name: "Firm", path: "/firmManagement", pro: false }],
//   // },
//   // {
//   //   icon: <HiOutlineUserCircle />,
//   //   name: "User Profile",
//   //   path: "/profile",
//   // },
//   // {
//   //   icon: <HiOutlineUserCircle />,
//   //   name: "Vendor Management",
//   //   subItems: [{ name: "Vendor", path: "/vendor-tables", pro: false }, ],
//   // },
//   {
//   name: "Project Master",
//   icon: <CiViewList />,
//   subItems: [
//     { name: "Project Management", path: "/project-management", pro: false },
//     // { name: "Holiday Management", path: "/holiday", pro: false },
//     { name: "Location Management", path: "/location", pro: false },
//     // { name: "Leave Management", path: "/leaveallotment", pro: false },
//     { name: "Store Management", path: "/store", pro: false },
//     // { name: "Terms", path: "/term", pro: false },
//     { name: "Bio Machine", path: "/biomachine", pro: false },
//     { name: "Condition Master", path: "/condition", pro: false },
//     { name: "Firm", path: "/firmManagement", pro: false },
//     // { name: "Department", path: "/dep", pro: false },
//     // { name: "Designation", path: "/desig", pro: false },
//   ],
// },

//  {
//   name: "Material Master",
//   icon: <CiViewTable />,
//   subItems: [
//     { name: "Tax Management", path: "/tax", pro: false },
//     { name: "Unit Management", path: "/unit", pro: false },
//     { name: "Manufacturer Details", path: "/manuf", pro: false },
//     { name: "Category Management", path: "/category", pro: false },
//     { name: "SubCategory Management", path: "/subcategory", pro: false },
//     { name: "Item Management", path: "/item", pro: false },
//     // { name: "Vendor Master", path: "/vendormaster", pro: false },
//     // { name: "Group Master", path: "/groupmaster", pro: false },
//     // { name: "Vendor Material", path: "/vendormaterial", pro: false },
//   ],
// },

// {
//   name: "HRM",
//   icon: <CiViewList />,
//   subItems: [
//     { name: "Leave Allotment", path: "/leaveallotment", pro: false },
//     { name: "Holiday Management", path: "/holiday", pro: false },
//     { name: "Location Management", path: "/location", pro: false },
//     { name: "Leave Management", path: "/leaveallotment", pro: false },
//     // { name: "Store Management", path: "/store", pro: false },
//     // { name: "Terms", path: "/term", pro: false },
//     // { name: "Bio Machine", path: "/biomachine", pro: false },
//     // { name: "Condition Master", path: "/condition", pro: false },
//      {
//     name: " Group Master",
//     // icon: <CiViewTable />,
//     subItems: [{ name: " Group Master", path: "/groupmaster", pro: false }],
//   },
//     { name: "Department", path: "/dep", pro: false },
//     { name: "Designation", path: "/desig", pro: false },
//     {name:"User Management",path: "/user-table",pro:false},
//   ],
// },

// {
//   name: "Vendor Managemnet",
//   icon: <CiViewList />,
//   subItems: [
//   { name: " Vendor Master", path: "/vendormaster", pro: false },
//   { name: " Vendor Material", path: "/vendormaterial", pro: false }],
//   },
  
  
//   //  
   
//   // ],



//   // {
//   //   name: " Vendor Master",
//   //   icon: <CiViewTable />,
//   //   subItems: [{ name: " Vendor Master", path: "/vendormaster", pro: false }],
//   // },
//   // {
//   //   name: " Group Master",
//   //   icon: <CiViewTable />,
//   //   subItems: [{ name: " Group Master", path: "/groupmaster", pro: false }],
//   // },
//   // {
//   //   name: " Vendor Material",
//   //   icon: <CiViewTable />,
//   //   subItems: [{ name: " Vendor Material", path: "/vendormaterial", pro: false }],
//   // },
// // ];

// // const othersItems = [
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "Charts",
// //     subItems: [
// //       { name: "Line Chart", path: "/line-chart", pro: false },
// //       { name: "Bar Chart", path: "/bar-chart", pro: false },
// //     ],
// //   },
// //   {
// //     icon: <HiOutlineUserCircle />,
// //     name: "UI Elements",
// //     subItems: [
// //       { name: "Alerts", path: "/alerts", pro: false },
// //       { name: "Avatar", path: "/avatars", pro: false },
// //       { name: "Badge", path: "/badge", pro: false },
// //       { name: "Buttons", path: "/buttons", pro: false },
// //       { name: "Images", path: "/images", pro: false },
// //       { name: "Videos", path: "/videos", pro: false },
// //     ],
// //   },
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "Authentication",
//     subItems: [
//       { name: "Sign In", path: "/signin", pro: false },
//       { name: "Sign Up", path: "/signup", pro: false },
//     ],
//   },
// ];

// const AppSidebar = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();

//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [subMenuHeight, setSubMenuHeight] = useState({});
//   const subMenuRefs = useRef({});

//   const isActive = useCallback(
//     (path) => location.pathname === path,
//     [location.pathname]
//   );

//   const isSubmenuActive = (nav) => {
//     if (!nav.subItems) return false;
//     return nav.subItems.some((sub) => isActive(sub.path));
//   };

//   useEffect(() => {
//     let submenuMatched = false;
//     ["main", "others"].forEach((menuType) => {
//       const items = menuType === "main" ? navItems : othersItems;
//       items.forEach((nav, index) => {
//         if (nav.subItems) {
//           nav.subItems.forEach((subItem) => {
//             if (isActive(subItem.path)) {
//               setOpenSubmenu({
//                 type: menuType,
//                 index,
//               });
//               submenuMatched = true;
//             }
//           });
//         }
//       });
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [location, isActive]);

//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `${openSubmenu.type}-${openSubmenu.index}`;
//       if (subMenuRefs.current[key]) {
//         setSubMenuHeight((prevHeights) => ({
//           ...prevHeights,
//           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (index, menuType) => {
//     setOpenSubmenu((prevOpenSubmenu) => {
//       if (
//         prevOpenSubmenu &&
//         prevOpenSubmenu.type === menuType &&
//         prevOpenSubmenu.index === index
//       ) {
//         return null;
//       }
//       return { type: menuType, index };
//     });
//   };

//   const renderMenuItems = (items, menuType) => (
//     <ul className="flex flex-col gap-4">
//       {items.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index, menuType)}
//              className={`menu-item group cursor-pointer ${
//   isSubmenuActive(nav)
//     ? "bg-blue-100"
//     : "bg-gray-100 hover:bg-blue-50"
// }`}

//             >
//               <span
//                 className={`menu-item-icon-size  ${
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? "menu-item-icon-active"
//                     : "menu-item-icon-inactive"
//                 }`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                <span
//   className={`menu-item-icon-size ${
//     isSubmenuActive(nav)
//       ? "text-blue-800"
//       : "text-black group-hover:text-blue-800"
//   }`}
// >
//   {nav.name}
// </span>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <IoIosArrowUp
//                   className={`ml-auto w-5 h-5 transition-transform duration-200 ${
//                     openSubmenu?.type === menuType &&
//                     openSubmenu?.index === index
//                       ? "rotate-180 text-blue-800"
//                       : "text-black group-hover:text-blue-800"
//                   }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`menu-item group ${
//                   isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                 }`}
//               >
//                 <span
//                   className={`menu-item-icon-size ${
//                     isActive(nav.path)
//                       ? "menu-item-icon-active"
//                       : "menu-item-icon-inactive"
//                   }`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                  <span
//   className={`menu-item-icon-size ${
//     isSubmenuActive(nav)
//       ? "text-blue-800"
//       : "text-black group-hover:text-blue-800"
//   }`}
// >
//   {nav.name}
// </span>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`${menuType}-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 space-y-1 ml-9">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       to={subItem.path}
//                       className={`menu-dropdown-item group ${
//                         isActive(subItem.path)
//                           ? "menu-dropdown-item-active text-blue-800"
//                           : "menu-dropdown-item-inactive text-black hover:text-blue-800"
//                       }`}
//                     >
//                       {subItem.name}
//                       <span className="flex items-center gap-1 ml-auto">
//                         {subItem.new && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active text-blue-800"
//                                 : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
//                             } menu-dropdown-badge`}
//                           >
//                             new
//                           </span>
//                         )}
//                         {subItem.pro && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active text-blue-800"
//                                 : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
//                             } menu-dropdown-badge`}
//                           >
//                             pro
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       style={{
//         background: "#f8fafc",
//       }}
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-black h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 

//           ${isExpanded || isMobileOpen
//             ? "w-[290px]"
//             : isHovered
//             ? "w-[290px]"
//             : "w-[90px]"
//         }
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`py-8 flex ${
//           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//         }`}
//       >
//        <Link to="/" className="flex items-center justify-center w-full gap-2">
//   {/* <img
//     src="http://csms.linksoft.in/csms/images/tagor.jpeg"
//     alt="HS Tagore Constructions"
//     className="h-8 w-8 object-contain"
//   /> */}

//   {isExpanded || isHovered || isMobileOpen ? (
//     <div className="font-bold text-xl tracking-wider text-blue-800">
//       H S TAGORE CONSTRUCTIONS
//     </div>
//   ) : (
//     <div className="font-bold text-lg text-blue-800">
//       KST
//     </div>
//   )}
// </Link>

//       </div>
//       <hr className="border-gray-300 mb-4" />
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Menu"
//                 ) : (
//                   <p className="text-gray-600">M</p>
//                 )}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>
//             <div className="">
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Others"
//                 ) : (
//                   <p className="text-gray-600">O</p>
//                 )}
//               </h2>
//               {renderMenuItems(othersItems, "others")}
//             </div>
//           </div>
//         </nav>
//         {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;


// import { useCallback, useEffect, useRef, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
// import { CiGrid41, CiCalendar, CiViewList, CiViewTable } from "react-icons/ci";
// import { IoIosArrowUp } from "react-icons/io";
// import { HiOutlineUserCircle } from "react-icons/hi2";
// import { VscCopy } from "react-icons/vsc";

// const navItems = [
//   {
//     icon: <CiGrid41 />,
//     name: "Dashboard",
//     subItems: [{ name: "Home", path: "/", pro: false }],
//   },
//   {
//     name: "Project Master",
//     icon: <CiViewList />,
//     subItems: [
//       { name: "Project Management", path: "/project-management", pro: false },
//       { name: "Location Management", path: "/location", pro: false },
//       { name: "Store Management", path: "/store", pro: false },
//       { name: "Bio Machine", path: "/biomachine", pro: false },
//       { name: "Condition Master", path: "/condition", pro: false },
//       { name: "Firm", path: "/firmManagement", pro: false },
//       { name: "Contractor Master", path: "/contractormaster", pro: false },
//     ],
//   },
//   {
//     name: "Material Master",
//     icon: <CiViewTable />,
//     subItems: [
//       { name: "Tax Management", path: "/tax", pro: false },
//       { name: "Unit Management", path: "/unit", pro: false },
//       { name: "Manufacturer Details", path: "/manuf", pro: false },
//       { name: "Category Management", path: "/category", pro: false },
//       { name: "SubCategory Management", path: "/subcategory", pro: false },
//       { name: "Item Management", path: "/item", pro: false },
//       // { name: "Opening Balance", path: "/ledgeropeningbalance", pro: false },

//     ],
//   },
//   {
//     name: "HRM",
//     icon: <CiViewList />,
//     subItems: [
//       { name: "Leave Allotment", path: "/leaveallotment", pro: false },
//       { name: "Holiday Management", path: "/holiday", pro: false },
//       { name: "Group Master", path: "/groupmaster", pro: false },
//       { name: "Department", path: "/dep", pro: false },
//       { name: "Designation", path: "/desig", pro: false },
//       { name: "User Management", path: "/user-tables", pro: false },
//       { name: "Employee Management", path: "/employee", pro: false },
//     ],
//   },
//   {
//     name: "Vendor Management",
//     icon: <CiViewList />,
//     subItems: [
//       { name: "Vendor Master", path: "/vendormaster", pro: false },
//       { name: "Vendor Material", path: "/vendormaterial", pro: false },
//     ],
//   },
// ];

// const othersItems = [
//   {
//     icon: <HiOutlineUserCircle />,
//     name: "Authentication",
//     subItems: [
//       { name: "Sign In", path: "/signin", pro: false },
//       { name: "Sign Up", path: "/signup", pro: false },
//     ],
//   },
// ];

// const AppSidebar = () => {
//   const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
//   const location = useLocation();

//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [subMenuHeight, setSubMenuHeight] = useState({});
//   const subMenuRefs = useRef({});

//   const isActive = useCallback(
//     (path) => location.pathname === path,
//     [location.pathname]
//   );

//   const isSubmenuActive = (nav) => {
//     if (!nav.subItems) return false;
//     return nav.subItems.some((sub) => isActive(sub.path));
//   };

//   useEffect(() => {
//     let submenuMatched = false;
//     ["main", "others"].forEach((menuType) => {
//       const items = menuType === "main" ? navItems : othersItems;
//       items.forEach((nav, index) => {
//         if (nav.subItems) {
//           nav.subItems.forEach((subItem) => {
//             if (isActive(subItem.path)) {
//               setOpenSubmenu({
//                 type: menuType,
//                 index,
//               });
//               submenuMatched = true;
//             }
//           });
//         }
//       });
//     });

//     if (!submenuMatched) {
//       setOpenSubmenu(null);
//     }
//   }, [location, isActive]);

//   useEffect(() => {
//     if (openSubmenu !== null) {
//       const key = `${openSubmenu.type}-${openSubmenu.index}`;
//       if (subMenuRefs.current[key]) {
//         setSubMenuHeight((prevHeights) => ({
//           ...prevHeights,
//           [key]: subMenuRefs.current[key]?.scrollHeight || 0,
//         }));
//       }
//     }
//   }, [openSubmenu]);

//   const handleSubmenuToggle = (index, menuType) => {
//     setOpenSubmenu((prevOpenSubmenu) => {
//       if (
//         prevOpenSubmenu &&
//         prevOpenSubmenu.type === menuType &&
//         prevOpenSubmenu.index === index
//       ) {
//         return null;
//       }
//       return { type: menuType, index };
//     });
//   };

//   const renderMenuItems = (items, menuType) => (
//     <ul className="flex flex-col gap-4">
//       {items.map((nav, index) => (
//         <li key={nav.name}>
//           {nav.subItems ? (
//             <button
//               onClick={() => handleSubmenuToggle(index, menuType)}
//               className={`menu-item group cursor-pointer ${
//                 isSubmenuActive(nav)
//                   ? "bg-blue-100"
//                   : "bg-gray-100 hover:bg-blue-50"
//               }`}
//             >
//               <span
//                 className={`menu-item-icon-size ${
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? "menu-item-icon-active"
//                     : "menu-item-icon-inactive"
//                 }`}
//               >
//                 {nav.icon}
//               </span>
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <span
//                   className={`menu-item-icon-size ${
//                     isSubmenuActive(nav)
//                       ? "text-blue-800"
//                       : "text-black group-hover:text-blue-800"
//                   }`}
//                 >
//                   {nav.name}
//                 </span>
//               )}
//               {(isExpanded || isHovered || isMobileOpen) && (
//                 <IoIosArrowUp
//                   className={`ml-auto w-5 h-5 transition-transform duration-200 ${
//                     openSubmenu?.type === menuType &&
//                     openSubmenu?.index === index
//                       ? "rotate-180 text-blue-800"
//                       : "text-black group-hover:text-blue-800"
//                   }`}
//                 />
//               )}
//             </button>
//           ) : (
//             nav.path && (
//               <Link
//                 to={nav.path}
//                 className={`menu-item group ${
//                   isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
//                 }`}
//               >
//                 <span
//                   className={`menu-item-icon-size ${
//                     isActive(nav.path)
//                       ? "menu-item-icon-active"
//                       : "menu-item-icon-inactive"
//                   }`}
//                 >
//                   {nav.icon}
//                 </span>
//                 {(isExpanded || isHovered || isMobileOpen) && (
//                   <span
//                     className={`menu-item-icon-size ${
//                       isSubmenuActive(nav)
//                         ? "text-blue-800"
//                         : "text-black group-hover:text-blue-800"
//                     }`}
//                   >
//                     {nav.name}
//                   </span>
//                 )}
//               </Link>
//             )
//           )}
//           {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
//             <div
//               ref={(el) => {
//                 subMenuRefs.current[`${menuType}-${index}`] = el;
//               }}
//               className="overflow-hidden transition-all duration-300"
//               style={{
//                 height:
//                   openSubmenu?.type === menuType && openSubmenu?.index === index
//                     ? `${subMenuHeight[`${menuType}-${index}`]}px`
//                     : "0px",
//               }}
//             >
//               <ul className="mt-2 space-y-1 ml-9">
//                 {nav.subItems.map((subItem) => (
//                   <li key={subItem.name}>
//                     <Link
//                       to={subItem.path}
//                       className={`menu-dropdown-item group ${
//                         isActive(subItem.path)
//                           ? "menu-dropdown-item-active text-blue-800"
//                           : "menu-dropdown-item-inactive text-black hover:text-blue-800"
//                       }`}
//                     >
//                       {subItem.name}
//                       <span className="flex items-center gap-1 ml-auto">
//                         {subItem.new && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active text-blue-800"
//                                 : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
//                             } menu-dropdown-badge`}
//                           >
//                             new
//                           </span>
//                         )}
//                         {subItem.pro && (
//                           <span
//                             className={`ml-auto ${
//                               isActive(subItem.path)
//                                 ? "menu-dropdown-badge-active text-blue-800"
//                                 : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
//                             } menu-dropdown-badge`}
//                           >
//                             pro
//                           </span>
//                         )}
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </li>
//       ))}
//     </ul>
//   );

//   return (
//     <aside
//       style={{
//         background: "#f8fafc",
//       }}
//       className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-black h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
//           ${isExpanded || isMobileOpen
//             ? "w-[290px]"
//             : isHovered
//             ? "w-[290px]"
//             : "w-[90px]"
//         }
//         ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
//         lg:translate-x-0`}
//       onMouseEnter={() => !isExpanded && setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <div
//         className={`py-8 flex ${
//           !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
//         }`}
//       >
//        <Link to="/" className="flex items-center justify-center w-full gap-2">
//   {isExpanded || isHovered || isMobileOpen ? (
//     <div className="font-bold text-xl tracking-wider text-blue-800">
//       H S TAGORE CONSTRUCTIONS
//     </div>
//   ) : (
//     <div className="font-bold text-lg text-blue-800">
//       KST
//     </div>
// )}
// </Link>

//       </div>
//       <hr className="border-gray-300 mb-4" />
//       <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
//         <nav className="mb-6">
//           <div className="flex flex-col gap-4">
//             <div>
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Menu"
//                 ) : (
//                   <p className="text-gray-600">M</p>
//                 )}
//               </h2>
//               {renderMenuItems(navItems, "main")}
//             </div>
//             <div className="">
//               <h2
//                 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
//                   !isExpanded && !isHovered
//                     ? "lg:justify-center"
//                     : "justify-start"
//                 }`}
//               >
//                 {isExpanded || isHovered || isMobileOpen ? (
//                   "Others"
//                 ) : (
//                   <p className="text-gray-600">O</p>
//                 )}
//               </h2>
//               {renderMenuItems(othersItems, "others")}
//             </div>
//           </div>
//         </nav>
//         {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
//       </div>
//     </aside>
//   );
// };

// export default AppSidebar;

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { CiGrid41, CiCalendar, CiViewList, CiViewTable } from "react-icons/ci";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { VscCopy } from "react-icons/vsc";

const navItems = [
  {
    icon: <CiGrid41 />,
    name: "Dashboard",
    subItems: [{ name: "Home", path: "/", pro: false }],
  },
  {
    name: "Project Master",
    icon: <CiViewList />,
    subItems: [
      { name: "Project Management", path: "/project-management", pro: false },
       { name: "Firm", path: "/firmManagement", pro: false },
      { name: "Location Management", path: "/location", pro: false },
      { name: "Bio Machine", path: "/biomachine", pro: false },
    ],
  },
  {
    name: "Material Master",
    icon: <CiViewTable />,
    subItems: [
      { name: "Add Material", path: "/item", pro: false },
      { name: "Unit Management", path: "/unit", pro: false },
      { name: "Category Management", path: "/category", pro: false },
      { name: "SubCategory Management", path: "/subcategory", pro: false },
      
     
    ],
  },
   {
    name: "Vendor Master",
    icon: <CiViewList />,
    subItems: [
      { name: "Vendor Management", path: "/vendormaster", pro: false },
      { name: "Vendor Wise Material", path: "/vendormaterial", pro: false },
    ],
  },
  {
    name:"Inventory",
    icon:<CiViewList/>,
    subItems:[
       { name: "MMR", path: "/mmr", pro: false },
       {name: "Store Inventory" , path: "/storeinv", pro: false},
    ]
  },
  {
    name: "HRM",
    icon: <CiViewList />,
    subItems: [
       { name: "User Management", path: "/user-tables", pro: false },
       { name: "Employee Management", path: "/employee", pro: false },
      { name: "Department", path: "/dep", pro: false },
      { name: "Designation", path: "/desig", pro: false },
        { name: "Holiday Management", path: "/holiday", pro: false },
         { name: "Leave Allotment", path: "/leaveallotment", pro: false },
         { name: "Manual Attandence", path: "/attendanceManagement", pro: false },
      
    ],

  },
  {
    name:"Contractor Master",
    icon:<CiViewList/>,
    subItems:[
 { name: "Contractor", path: "/contractormaster", pro: false },
    ]
  },
  {
    name:"Settings",
    icon:<CiViewList/>,
    subItems:[
      { name: "Tax Management", path: "/tax", pro: false },
      { name: "Manufacturer Details", path: "/manuf", pro: false },
      { name: "Group Master", path: "/groupmaster", pro: false },
       { name: "Store Management", path: "/store", pro: false },
        { name: "Condition Master", path: "/condition", pro: false },
    ]
  }
 
];



const othersItems = [
  {
    icon: <HiOutlineUserCircle />,
    name: "Security",
    subItems: [
      { name: "Role & Permission", path: "/rolepermission", pro: false },
      // { name: "Permission", path: "/permission", pro: false },
    ],
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const isSubmenuActive = (nav) => {
    if (!nav.subItems) return false;
    return nav.subItems.some((sub) => isActive(sub.path));
  };

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group cursor-pointer ${
                isSubmenuActive(nav)
                  ? "bg-blue-100"
                  : "bg-gray-100 hover:bg-blue-50"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span
                  className={`menu-item-icon-size ${
                    isSubmenuActive(nav)
                      ? "text-blue-800"
                      : "text-black group-hover:text-blue-800"
                  }`}
                >
                  {nav.name}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <IoIosArrowUp
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-blue-800"
                      : "text-black group-hover:text-blue-800"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span
                    className={`menu-item-icon-size ${
                      isSubmenuActive(nav)
                        ? "text-blue-800"
                        : "text-black group-hover:text-blue-800"
                    }`}
                  >
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item group ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active text-blue-800"
                          : "menu-dropdown-item-inactive text-black hover:text-blue-800"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active text-blue-800"
                                : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active text-blue-800"
                                : "menu-dropdown-badge-inactive text-black group-hover:text-blue-800"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      style={{
        background: "#f8fafc",
      }}
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-black h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
       <Link to="/" className="flex items-center justify-center w-full gap-2">
  {isExpanded || isHovered || isMobileOpen ? (
    <img 
      src="http://csms.linksoft.in/csms/images/tagor.jpeg" 
      alt="H S Tagore Constructions" 
      className="h-12 w-auto object-contain"
    />
  ) : (
    <img 
      src="http://csms.linksoft.in/csms/images/tagor.jpeg" 
      alt="KST" 
      className="h-10 w-10 object-cover rounded"
    />
)}
</Link>

      </div>
      <hr className="border-gray-300 mb-4" />
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <p className="text-gray-600">M</p>
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              {/* <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-600 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <p className="text-gray-600">O</p>
                )}
              </h2> */}
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;