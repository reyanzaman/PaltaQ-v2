"use client";

import React from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

const SideNav = () => {
  const { isHomeActive, isDashboardActive, isQuestionsActive, isInfoActive } =
    useNavigation();

  return (
    <div>

      {/* Desktop */}
      <div className="lg:flex hidden z-100">
        <div className="flex-col fixed justify-between items-center pt-8 pb-5 card btn bg-[#e6e7ee] h-screen w-[110px] md:w-[110px]">
          <div className="space-y-6">
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

            <Link
              href="/dashboard"
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

            <Link
              href="/questions"
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

            <Link
              href="/info"
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
          </div>

          <Link
            href="/info"
            className="flex flex-row space-x-1 items-center"
            data-tooltip-content="Login"
            data-tooltip-id="btn-login"
            data-tooltip-place="right"
          >
            {isInfoActive ? (
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                width={30}
                className="text-3xl bg-white hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
              />
            ) : (
              <FontAwesomeIcon
                icon={faArrowRightToBracket}
                width={30}
                className="text-3xl text-zinc-500 hover:text-black p-3 icon shadow-inset border border-light rounded-circle"
              />
            )}
          </Link>
        </div>
      </div>

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
      </div>

      {/* Mobile */}
      <div className="lg:hidden block fixed ml-2 mt-2">
        <Link href="/" className="flex flex-row space-x-1 items-center">
          {isHomeActive ? (
            <FontAwesomeIcon
              icon={faBars}
              className="text-xl bg-white hover:text-black p-[0.65rem] icon shadow-inset border border-light rounded-circle"
            />
          ) : (
            <FontAwesomeIcon
              icon={faBars}
              className="text-xl text-zinc-500 p-[0.65rem] icon shadow-inset border border-light rounded-circle"
            />
          )}
        </Link>
      </div>

    </div>
  );
};

export default SideNav;
