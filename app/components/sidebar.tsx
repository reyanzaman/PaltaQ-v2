"use client";

import Link from "next/link";
import useNavigation from "@/app/lib/useNavigation";
import "@/app/ui/neomorphism.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouseChimney,
  faUserTie,
  faQ,
  faInfo,
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faBars,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";

interface SideNavProps {
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isMobile, isMobileMenuOpen, toggleMobileMenu , setIsMobileMenuOpen }) => {
  const { isHomeActive, isDashboardActive, isQuestionsActive, isInfoActive, isAdminActive } = useNavigation();

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [IsAdmin, setIsAdmin] = useState(false);

  const getisAdmin = async () => {
    if (!session) {
      return;
    }
    const queryParams = new URLSearchParams({ email: session?.user?.email ?? '' });

    try {
      const response = await fetch(`/api/getisAdmin?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAdmin(await response.json());
      }
    } catch (error) {
      console.error('Failed to get isAdmin:', error);
    }
  };

  useEffect(() => {
    getisAdmin();
  }, [session]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  }
  
  return (
    <div>

      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="lg:hidden fixed right-0 top-0 h-screen bg-[#e6e7ee] w-full z-50"> {/* Adjusted z-index */}
          <div className="flex flex-col justify-start items-start pl-4 pt-7 pb-5 space-y-6">
            {/* Links */}
            <Link href="/" onClick={handleLinkClick} className="flex flex-row space-x-1 items-center">
              <FontAwesomeIcon icon={faHouseChimney} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
              <span className="text-3xl ml-3 font-bold text-neutral-500">Home</span>
            </Link>
            <hr className="border-neutral-300 w-full" />
            <Link href={isLoggedIn ? "/pages/dashboard" : "#"} onClick={() => {isLoggedIn ? "" : signIn('google'); handleLinkClick()}} className="flex flex-row space-x-1 items-center">
              <FontAwesomeIcon icon={faUserTie} width={30} className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
              <span className="text-3xl ml-3 font-bold text-neutral-500">Dashboard</span>
            </Link>
            <hr className="border-neutral-300 w-full" />
            <Link href={isLoggedIn ? "/pages/questions" : "#"} onClick={() => {isLoggedIn ? "" : signIn('google'); handleLinkClick()}} className="flex flex-row space-x-1 items-center">
              <FontAwesomeIcon icon={faQ} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
              <span className="text-3xl ml-3 font-bold text-neutral-500">Questions</span>
            </Link>
            <hr className="border-neutral-300 w-full" />
            <Link href="/pages/info" onClick={handleLinkClick} className="flex flex-row space-x-1 items-center">
              <FontAwesomeIcon icon={faInfo} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
              <span className="text-3xl ml-3 font-bold text-neutral-500">Info</span>
            </Link>
            {IsAdmin && (
              <div className="w-full m-0">
                <hr className="border-neutral-300 w-full" />
                <Link href="/pages/admin" onClick={handleLinkClick} className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faScrewdriverWrench} width={30} className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-500">Admin Panel</span>
                </Link>
              </div>
            )}
            <hr className="border-neutral-300 w-full" />
            <Link href="#" onClick={() => {isLoggedIn ? signOut() : signIn('google'); handleLinkClick()}} className="flex flex-row space-x-1 items-center">
              <FontAwesomeIcon icon={isLoggedIn ? faArrowRightFromBracket : faArrowRightToBracket} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
              <span className="text-3xl ml-3 font-bold text-neutral-500">{isLoggedIn ? "Logout" : "Login"}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Toggle Button */}
      <div className="lg:hidden block fixed mr-[1.6em] mt-[2em] right-0 z-50"> {/* Adjusted z-index */}
        <div className="btn btn-pill btn-icon-only btn-primary" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={faBars} className="text-xl translate-y-[0.45em]" />
        </div>
      </div>

      {/* Desktop */}
      {!isMobileMenuOpen && (
        <div className="lg:flex hidden fixed left-0 top-0 h-screen">
          <div className="flex-col justify-between items-center pt-8 pb-5 card btn bg-[#e6e7ee] w-[110px] md:w-[110px]">
            <div className="space-y-6">

              {/* Home */}
              <Link
                href="/"
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content="Home"
                data-tooltip-id="btn-home"
                data-tooltip-place="right"
              >
                {isHomeActive ? (
                  <FontAwesomeIcon
                    icon={faHouseChimney}
                    className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faHouseChimney}
                    className="text-3xl text-zinc-500 p-3 icon shadow-inset border border-light rounded-circle"
                  />
                )}
              </Link>

              {/* Dashboard */}
              <Link
                href={isLoggedIn ? "/pages/dashboard" : "#"}
                onClick={() => isLoggedIn ? "" : signIn('google')}
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content="Dashboard"
                data-tooltip-id="btn-dash"
                data-tooltip-place="right"
              >
                {isDashboardActive ? (
                  <FontAwesomeIcon
                    icon={faUserTie}
                    width={30}
                    className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUserTie}
                    width={30}
                    className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                )}
              </Link>

              {/* Questions */}
              <Link
                href={isLoggedIn ? "/pages/questions" : "#"}
                onClick={() => isLoggedIn ? "" : signIn('google')}
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content="Questions"
                data-tooltip-id="btn-ques"
                data-tooltip-place="right"
              >
                {isQuestionsActive ? (
                  <FontAwesomeIcon
                    icon={faQ}
                    width={30}
                    className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faQ}
                    width={30}
                    className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                )}
              </Link>

              {/* Info */}
              <Link
                href="/pages/info"
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content="Info"
                data-tooltip-id="btn-info"
                data-tooltip-place="right"
              >
                {isInfoActive ? (
                  <FontAwesomeIcon
                    icon={faInfo}
                    width={30}
                    className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faInfo}
                    width={30}
                    className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                  />
                )}
              </Link>

              {/* Admin */}
              {IsAdmin && (
                <Link
                  href="/pages/admin"
                  className="flex flex-row space-x-1 items-center"
                  data-tooltip-content="Admin"
                  data-tooltip-id="btn-admin"
                  data-tooltip-place="right"
                >
                  {isAdminActive ? (
                    <FontAwesomeIcon
                      icon={faScrewdriverWrench}
                      width={30}
                      className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faScrewdriverWrench}
                      width={30}
                      className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                    />
                  )}
                </Link>
              )}

            </div>

            {/* Sign-In / Sign-Out */}
            <Link
              href="#"
              onClick={() => isLoggedIn ? signOut() : signIn('google')}
              className="flex flex-row space-x-1 items-center"
              data-tooltip-content={isLoggedIn ? "logout" : "login"}
              data-tooltip-id="btn-login"
              data-tooltip-place="right"
            >
              {isLoggedIn ? (
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  width={30}
                  className="text-3xl hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  width={30}
                  className="text-3xl hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                />
              )}
            </Link>

          </div>
        </div>
      )}

      {/* Tooltips */}
      <div>
        <Tooltip
          id="btn-home"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
        <Tooltip
          id="btn-dash"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
        <Tooltip
          id="btn-ques"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
        <Tooltip
          id="btn-info"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
        <Tooltip
          id="btn-login"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
        <Tooltip
          id="btn-admin"
          place="right"
          style={{
            backgroundColor: "rgb(240, 240, 240)" /* Background color */,
            boxShadow:
              "5px 5px 15px rgba(0, 0, 0, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.5)" /* Soft shadows */,
            borderRadius: "8px" /* Rounded corners */,
            padding: "10px" /* Padding */,
            color: "#222" /* Text color */,
            zIndex: "100" /* Ensure it's above other elements */,
            opacity: "1",
          }}
        />
      </div>

    </div>
  );
};

export default SideNav;