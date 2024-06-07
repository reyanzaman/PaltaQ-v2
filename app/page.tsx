import {
  faFlag,
  faUser,
  faThumbsUp,
  faThumbsDown,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { nunito, dancing_script } from "@/app/ui/fonts";
import "@/app/ui/neomorphism.css";
import "@/app/ui/style.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideNav from "@/app/components/sidebar";
import QuestionBox from "@/app/components/questionbox";
import type { Metadata } from "next";
import UserImage from "@/app/components/userimage";

export const metadata: Metadata = {
  title: "PaltaQ",
  description: "PaltaQ V2",
};

export default function Home() {
  
  return (
    <div className={`${nunito.className} antialiased flex flex-row`}>

      {/* Sidebar */}
      <SideNav />

      <UserImage />

      <div className="w-full">
        <div className="mb-2 lg:mt-[2.5em] mt-[4.5em]">
          <h1
            className={`${dancing_script.className} antialiased text-6xl text-center m-4`}
          >
            Palta Question
          </h1>

          <QuestionBox />

          {/* Question Card */}
          <div className="card bg-primary shadow-inset border-light w-[90%] mx-auto mb-4">
            <div className="card-body p-4">
              <div className="flex flex-row justify-between mb-3">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-[2rem] btn btn-pill p-1 mr-1"
                  />
                  <span className="font-bold ml-2">reyanzaman</span>
                </div>
                <button className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-0.5 -translate-y-1"
                  />
                  <span className="font-bold lg:block hidden">Flag as Off-Topic</span>
                </button>
              </div>

              <div className="flex flex-row">
                <h4 className="lg:text-lg text-base mb-2 text-justify">
                  What is your question? Can I ask a question? What is the
                  purpose of this application? Does this application really
                  work? Is it wise to debug this application?
                </h4>
              </div>

              <div>
                <span className="small mr-1">
                  On Friday, 17/05/2024, 9:05 AM
                </span>
                <br></br>

                <div className="flex mt-2">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">10</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faThumbsDown} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">5</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faComment} className="w-[1rem]" />
                  <span className="small ml-1">5</span>
                </div>
              </div>

              <hr className="my-2"></hr>

              <div className="">
                <button>
                  <span className="small mr-1 hover:text-blue-600 hover:font-bold transition-all duration-200">
                    Like
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-red-900 hover:font-bold transition-all duration-200">
                    Dislike
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-lime-700 hover:font-bold transition-all duration-200">
                    Palta Question
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Question Card To Be Removed */}
          <div className="card bg-primary shadow-inset border-light w-[90%] mx-auto mb-4">
            <div className="card-body p-4">
              <div className="flex flex-row justify-between mb-3">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-[2rem] btn btn-pill p-1 mr-1"
                  />
                  <span className="font-bold ml-2">user123</span>
                </div>
                <button className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-0.5 -translate-y-1"
                  />
                  <span className="font-bold lg:block hidden">Flag as Off-Topic</span>
                </button>
              </div>

              <div className="flex flex-row">
                <h4 className="lg:text-lg text-base mb-2 text-justify">
                  Can you define the purpose of a loop in programming?
                </h4>
              </div>

              <div>
                <span className="small mr-1">
                  On Friday, 17/05/2024, 9:05 AM
                </span>
                <br></br>

                <div className="flex mt-2">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">1</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faThumbsDown} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">5</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faComment} className="w-[1rem]" />
                  <span className="small ml-1">3</span>
                </div>
              </div>

              <hr className="my-2"></hr>

              <div className="">
                <button>
                  <span className="small mr-1 hover:text-blue-600 hover:font-bold transition-all duration-200">
                    Like
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-red-900 hover:font-bold transition-all duration-200">
                    Dislike
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-lime-700 hover:font-bold transition-all duration-200">
                    Palta Question
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Question Card To Be Removed */}
          <div className="card bg-primary shadow-inset border-light w-[90%] mx-auto mb-4">
            <div className="card-body p-4">
              <div className="flex flex-row justify-between mb-3">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-[2rem] btn btn-pill p-1 mr-1"
                  />
                  <span className="font-bold ml-2">anotheruser321</span>
                </div>
                <button className="lg:flex flex-row items-start px-2 mx-3 hover:text-red-800 transition-colors duration-500 translate-x-5">
                  <FontAwesomeIcon
                    icon={faFlag}
                    className="w-[1rem] mr-2 lg:pt-[1.5px] pt-0 lg:translate-y-0.5 -translate-y-1"
                  />
                  <span className="font-bold lg:block hidden">Flag as Off-Topic</span>
                </button>
              </div>

              <div className="flex flex-row">
                <h4 className="lg:text-lg text-base mb-2 text-justify">
                  What is a loop?
                </h4>
              </div>

              <div>
                <span className="small mr-1">
                  On Friday, 17/05/2024, 9:05 AM
                </span>
                <br></br>

                <div className="flex mt-2">
                  <FontAwesomeIcon icon={faThumbsUp} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">2</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faThumbsDown} className="w-[1rem]" />
                  <span className="small ml-1 mr-2">3</span>
                  <span className="small mr-2">|</span>
                  <FontAwesomeIcon icon={faComment} className="w-[1rem]" />
                  <span className="small ml-1">0</span>
                </div>
              </div>

              <hr className="my-2"></hr>

              <div className="">
                <button>
                  <span className="small mr-1 hover:text-blue-600 hover:font-bold transition-all duration-200">
                    Like
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-red-900 hover:font-bold transition-all duration-200">
                    Dislike
                  </span>
                </button>
                <span className="small mr-1">|</span>
                <button>
                  <span className="small mr-1 hover:text-lime-700 hover:font-bold transition-all duration-200">
                    Palta Question
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-fit bottom-0">
            <p className="text-sm">PaltaQ Version 2.00</p>
          </div>

        </div>
      </div>
    </div>
  );
}
