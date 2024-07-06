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

const SideNav: React.FC<SideNavProps> = ({ isMobile, isMobileMenuOpen, toggleMobileMenu, setIsMobileMenuOpen }) => {
  const { isHomeActive, isDashboardActive, isQuestionsActive, isInfoActive, isAdminActive } = useNavigation();

  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [IsAdmin, setIsAdmin] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setLogoutGoogle(false);
  };

  const [logoutGoogle, setLogoutGoogle] = useState(false);

  const handleCheckboxChange = (e: any) => {
    setLogoutGoogle(e.target.checked);
  };

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

      const responseText = await response.json();

      if (response.ok) {
        if (responseText.message === 'true') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Failed to get isAdmin:', error);
    }
  };

  const handleLogout = () => {
    if (logoutGoogle) {
      signOut({ callbackUrl: "/" });
    } else {
      signOut();
    }
    closeModal();
    setLogoutGoogle(false);
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

            <Link href="/" onClick={handleLinkClick} className="">
              {isHomeActive ? (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faHouseChimney} className="text-3xl bg-white text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-700">Home</span>
                </div>
              ) : (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faHouseChimney} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-500">Home</span>
                </div>
              )}
            </Link>

            <hr className="border-neutral-300 w-full" />

            <Link href={isLoggedIn ? "/pages/dashboard" : "#"} onClick={() => { isLoggedIn ? "" : signIn('google'); handleLinkClick() }} className="flex flex-row space-x-1 items-center">
              {isDashboardActive ? (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faUserTie} width={30} className="text-3xl bg-white text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-700">Dashboard</span>
                </div>
              ) : (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faUserTie} width={30} className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-500">Dashboard</span>
                </div>
              )}
            </Link>

            <hr className="border-neutral-300 w-full" />

            <Link href={isLoggedIn ? "/pages/questions" : "#"} onClick={() => { isLoggedIn ? "" : signIn('google'); handleLinkClick() }} className="flex flex-row space-x-1 items-center">
              {isQuestionsActive ? (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faQ} width={30} className="text-3xl bg-white text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-700">Questions</span>
                </div>
              ) : (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faQ} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-500">Questions</span>
                </div>
              )}
            </Link>

            <hr className="border-neutral-300 w-full" />

            <Link href="/pages/info" onClick={handleLinkClick} className="flex flex-row space-x-1 items-center">
              {isInfoActive ? (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faInfo} width={30} className="text-3xl bg-white text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-700">Info</span>
                </div>
              ) : (
                <div className="flex flex-row space-x-1 items-center">
                  <FontAwesomeIcon icon={faInfo} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                  <span className="text-3xl ml-3 font-bold text-neutral-500">Info</span>
                </div>
              )}
            </Link>

            {IsAdmin && (
              <div className="w-full m-0">

                <hr className="border-neutral-300 w-full" />

                <Link href="/pages/admin" onClick={handleLinkClick} className="flex flex-row space-x-1 items-center">
                  {isDashboardActive ? (
                    <div className="flex flex-row space-x-1 items-center">
                      <FontAwesomeIcon icon={faScrewdriverWrench} width={30} className="text-3xl bg-white text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
                      <span className="text-3xl ml-3 font-bold text-neutral-700">Admin Panel</span>
                    </div>
                  ) : (
                    <div className="flex flex-row space-x-1 items-center">
                      <FontAwesomeIcon icon={faScrewdriverWrench} width={30} className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle" />
                      <span className="text-3xl ml-3 font-bold text-neutral-500">Admin Panel</span>
                    </div>
                  )}
                </Link>
              </div>
            )}

            <hr className="border-neutral-300 w-full" />

            {isLoggedIn ? (
              // Signout
              <button type="button" onClick={() => { openModal(); handleLinkClick() }} className="flex flex-row space-x-1 items-center">
                <FontAwesomeIcon icon={isLoggedIn ? faArrowRightFromBracket : faArrowRightToBracket} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                <span className="text-3xl ml-3 font-bold text-neutral-500">{ "Logout" }</span>
              </button>
            ) : (
              // Signin
              <Link href="#" onClick={() => { signIn('google'); handleLinkClick() }} className="flex flex-row space-x-1 items-center">
                <FontAwesomeIcon icon={isLoggedIn ? faArrowRightFromBracket : faArrowRightToBracket} width={30} className="text-3xl text-neutral-500 p-3 icon shadow-inset border border-light rounded-circle" />
                <span className="text-3xl ml-3 font-bold text-neutral-500">{ "Login" }</span>
              </Link>
            )}
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
                    className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
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
            {isLoggedIn ? (
              // Signout
              <button
                type="button"
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content={"logout"}
                data-tooltip-id="btn-login"
                data-tooltip-place="right"
                onClick={openModal}
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  width={30}
                  className="text-3xl hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                />
              </button>
            ) : (
              // Signin
              <Link
                href="#"
                onClick={() => signIn('google', { prompt: 'login' })}
                className="flex flex-row space-x-1 items-center"
                data-tooltip-content={"login"}
                data-tooltip-id="btn-login"
                data-tooltip-place="right"
              >
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  width={30}
                  className="text-3xl hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
                />
              </Link>
            )}

          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full lg:-translate-y-[35vh]">
              <div className="bg-primary">
                <div className="modal-body">
                  <button type="button" className="close" onClick={closeModal} aria-label="Close">
                    <span aria-hidden="true" className="scale-150">×</span>
                  </button>
                  <div className="py-3 text-center translate-y-4">
                    <span className="modal-icon display-1-lg"><span className="far fa-envelope-open"></span></span>
                    <h2 className="h4 my-3">Are you sure you want to logout?</h2>
                    <p>Always make sure to logout from both the <b>PaltaQ app</b> and <b>Google</b> if you are using a public computer in a public place.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="flex lg:flex-row flex-col gap-y-4 mx-auto">
                    <button type="button" className="btn btn-sm btn-primary h-fit py-2 px-3" onClick={handleLogout}>Logout</button>
                    <div className="custom-control custom-switch mx-3 lg:translate-y-2">
                      <div className="flex flex-row">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customSwitch1"
                          checked={logoutGoogle}
                          onChange={handleCheckboxChange}
                        />
                        <label className="custom-control-label" htmlFor="customSwitch1"></label>
                        <p className="-translate-x-4 lg:block hidden">Also log me out of Google</p>
                        <p className="-translate-x-4 lg:hidden block text-sm">Log me out of Google</p>
                      </div>
                    </div>
                  </div>
                  <div className="lg:block hidden"><button type="button" className="btn btn-primary text-danger" onClick={closeModal}>Cancel</button></div>
                </div>
              </div>
            </div>
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