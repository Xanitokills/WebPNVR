"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon, TableIcon, HorizontaLDots } from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  pro?: boolean;
  new?: boolean;
  subItems?: NavItem[];
};

const navItems: NavItem[] = [
  {
    name: "UGS",
    icon: <TableIcon />,
    subItems: [
      {
        name: "Focalización y Priorización",
        icon: <TableIcon />,
        subItems: [
          { name: "Ver Expediente", path: "/ugt/convenios/ver-expediente", pro: false },
        ],
      },
  {
        name: "Identificación y Seleccion de Familias",
        icon: <TableIcon />,
        subItems: [
          { name: "Ver Expediente", path: "/ugt/convenios/ver-expediente", pro: false },
        ],
      },

    ]
  },
  {
    name: "UGT",
    icon: <TableIcon />,
    subItems: [
        {
        name: "Expediente",
        icon: <TableIcon />,
        subItems: [
          { name: "Subir Expediente", path: "/expediente/subir-expediente", pro: false },
          { name: "Ver Expediente", path: "/expediente/ver-expediente", pro: false },
          { name: "Administrar Parámetros", path: "/expediente/administrar-parametros", pro: false },
          { name: "Presupuesto", path: "/expediente/presupuesto", pro: false },
        ],
      },
      {
        name: "Convenios",
        icon: <TableIcon />,
        subItems: [
          { name: "Ver Convenios", path: "/UGT/convenios/convenios", pro: false },
          { name: "Administrar Parámetros", path: "/UGT/convenios/parametros", pro: false },
        ],
      },
    
    ],
  },
   {
    name: "UATS",
    icon: <TableIcon />,
    subItems: [
        {
        name: "Expediente",
        icon: <TableIcon />,
        subItems: [
          { name: "Subir Expediente", path: "/expediente/subir-expediente", pro: false },
          { name: "Ver Expediente", path: "/expediente/ver-expediente", pro: false },
          { name: "Administrar Parámetros", path: "/expediente/administrar-parametros", pro: false },
          { name: "Presupuesto", path: "/expediente/presupuesto", pro: false },
        ],
      },
      {
        name: "Convenios",
        icon: <TableIcon />,
        subItems: [
          { name: "Ver Convenios", path: "/UGT/convenios/convenios", pro: false },
          { name: "Administrar Parámetros", path: "/UGT/convenios/parametros", pro: false },
        ],
      },
    
    ],
  },

  
];

const othersItems: NavItem[] = [
  {
    name: "Reportes",
    icon: <TableIcon />,
    path: "/reportes",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others",
    level: number = 1,
    parentIndex: string = ""
  ) => (
    <ul className={`flex flex-col gap-2 ${level > 1 ? "mt-1 ml-6" : ""}`}>
      {navItems.map((nav, index) => {
        const itemKey = parentIndex ? `${parentIndex}-${index}` : `${index}`;
        const key = `${menuType}-${itemKey}`;
        const isOpen = openSubmenus.has(key);
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(menuType, itemKey)}
                className={`menu-item group flex items-center w-full text-left p-2 rounded-md ${
                  isOpen
                    ? "menu-item-active bg-gray-100 dark:bg-gray-800"
                    : "menu-item-inactive hover:bg-gray-50 dark:hover:bg-gray-700"
                } cursor-pointer ${
                  !isExpanded && !isHovered && level === 1 ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                {nav.icon && (
                  <span
                    className={`${
                      isOpen
                        ? "menu-item-icon-active text-brand-500"
                        : "menu-item-icon-inactive text-gray-500"
                    } mr-2`}
                  >
                    {nav.icon}
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text flex-1`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && nav.subItems.length > 0 && (
                  <ChevronDownIcon
                    className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-brand-500" : "text-gray-400"
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group flex items-center p-2 rounded-md ${
                    isActive(nav.path)
                      ? "menu-item-active bg-gray-100 dark:bg-gray-800"
                      : "menu-item-inactive hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {nav.icon && (
                    <span
                      className={`${
                        isActive(nav.path)
                          ? "menu-item-icon-active text-brand-500"
                          : "menu-item-icon-inactive text-gray-500"
                      } mr-2`}
                    >
                      {nav.icon}
                    </span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text flex-1`}>{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (nav.pro || nav.new) && (
                    <span className="flex items-center gap-1 ml-auto">
                      {nav.new && (
                        <span
                          className={`${
                            isActive(nav.path)
                              ? "menu-dropdown-badge-active bg-brand-100 text-brand-700"
                              : "menu-dropdown-badge-inactive bg-gray-100 text-gray-700"
                          } menu-dropdown-badge text-xs px-2 py-0.5 rounded-full`}
                        >
                          nuevo
                        </span>
                      )}
                      {nav.pro && (
                        <span
                          className={`${
                            isActive(nav.path)
                              ? "menu-dropdown-badge-active bg-brand-100 text-brand-700"
                              : "menu-dropdown-badge-inactive bg-gray-100 text-gray-700"
                          } menu-dropdown-badge text-xs px-2 py-0.5 rounded-full`}
                        >
                          pro
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[key] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen ? `${subMenuHeight[key] || "auto"}px` : "0px",
                }}
              >
                {renderMenuItems(nav.subItems, menuType, level + 1, itemKey)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    const newOpenSubmenus = new Set<string>();
    const checkSubItems = (items: NavItem[], menuType: "main" | "others", parentIndex: string = "") => {
      items.forEach((nav, index) => {
        const itemKey = parentIndex ? `${parentIndex}-${index}` : `${index}`;
        const key = `${menuType}-${itemKey}`;
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (subItem.path && isActive(subItem.path)) {
              newOpenSubmenus.add(key);
              if (parentIndex) {
                const parentKey = `${menuType}-${parentIndex}`;
                newOpenSubmenus.add(parentKey);
              }
            }
            if (subItem.subItems) {
              checkSubItems(subItem.subItems, menuType, itemKey);
            }
          });
        }
      });
    };

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      checkSubItems(items, menuType as "main" | "others");
    });

    setOpenSubmenus(newOpenSubmenus);
  }, [pathname, isActive]);

  useEffect(() => {
    const updateHeights = () => {
      Object.keys(subMenuRefs.current).forEach((key) => {
        const el = subMenuRefs.current[key];
        if (el) {
          const height = el.scrollHeight;
          setSubMenuHeight((prev) => ({
            ...prev,
            [key]: height,
          }));
        }
      });
    };

    updateHeights();
    const observer = new ResizeObserver(updateHeights);
    Object.values(subMenuRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [openSubmenus]);

  const handleSubmenuToggle = (menuType: "main" | "others", index: string) => {
    const key = `${menuType}-${index}`;
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
        // Force height recalculation after opening
        setTimeout(() => {
          const el = subMenuRefs.current[key];
          if (el) {
            setSubMenuHeight((prev) => ({
              ...prev,
              [key]: el.scrollHeight,
            }));
          }
        }, 0);
      }
      return newSet;
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
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
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menú" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Otros" : <HorizontaLDots />}
              </h2>
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