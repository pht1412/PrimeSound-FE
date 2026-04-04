index.tsx

import { NowPlayingBarSection } from "./NowPlayingBarSection";
import { ProfileContentSection } from "./ProfileContentSection";
import { SidebarNavigationSection } from "./SidebarNavigationSection";

export const Account = (): JSX.Element => {
  return (
    <div className="flex flex-col min-h-screen items-start relative bg-black">
      <div className="flex items-start gap-2 pt-2 pb-0 px-2 relative flex-1 self-stretch w-full grow">
        <SidebarNavigationSection />
        <ProfileContentSection />
      </div>

      <NowPlayingBarSection />
    </div>
  );
};


NowPlayingBarsection.tsx

import { useRef, useState } from "react";

export const NowPlayingBarSection = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(true);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(28.77);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setProgress(Math.min(100, Math.max(0, percentage)));
    }
  };

  return (
    <div className="flex h-[90px] items-center justify-between px-6 py-0 relative self-stretch w-full bg-[#181818] border-t-[0.89px] [border-top-style:solid] border-[#fffefe1a]">
      {/* Left: Track Info */}
      <div className="flex w-[482.67px] items-center gap-4 relative">
        <div className="flex w-14 h-14 items-center justify-center relative bg-[#0000ff] rounded-md flex-shrink-0">
          <div className="absolute top-[calc(50.00%_-_28px)] left-0 w-14 h-14 bg-[#ffffff01] rounded-md shadow-[0px_4px_6px_-4px_#0000001a,0px_10px_15px_-3px_#0000001a]" />
          <div className="relative flex items-center justify-center w-fit [font-family:'Inter-Regular',Helvetica] font-normal text-[#fffefe80] text-[10.9px] text-center tracking-[0] leading-4 whitespace-nowrap">
            Cover
          </div>
        </div>

        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <div className="flex flex-col items-start pt-0 pb-[0.67px] px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13.5px] tracking-[0] leading-5 whitespace-nowrap">
              One last time
            </div>
          </div>
          <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
            <div className="w-fit whitespace-nowrap relative flex items-center mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#99a1ae] text-[11.1px] tracking-[0] leading-4">
              Ariana Grande
            </div>
          </div>
        </div>

        <div className="pl-2 pr-0 py-0 flex flex-col w-7 h-5 items-start relative">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex flex-col w-5 h-5 items-start justify-center relative bg-transparent border-none cursor-pointer p-0"
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <div className="relative flex-1 w-5 grow flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 14s-6-3.5-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.5-6 8-6 8z"
                  fill={isLiked ? "#1db954" : "none"}
                  stroke={isLiked ? "#1db954" : "#99a1ae"}
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Center: Player Controls */}
      <div className="flex flex-col w-[643.56px] items-center justify-center gap-2 relative">
        {/* Controls Row */}
        <div className="flex items-center gap-[18px] relative flex-[0_0_auto]">
          {/* Shuffle */}
          <button
            className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
            aria-label="Shuffle"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 3.5h2l-4 4-4-4h2c1.1 0 2.1.4 2.9 1.1L10.5 3.5z"
                fill="currentColor"
              />
              <path
                d="M10.5 12.5h2l-4-4-4 4h2c1.1 0 2.1-.4 2.9-1.1L10.5 12.5z"
                fill="currentColor"
              />
              <path
                d="M3.5 3.5l2 2M3.5 12.5l2-2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M2 8h1.5M12.5 5.5l1.5-2M12.5 10.5l1.5 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Previous */}
          <button
            className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
            aria-label="Previous track"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 3v10M12.5 3L6 8l6.5 5V3z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center w-8 h-8 bg-white rounded-full border-none cursor-pointer p-0 hover:scale-105 transition-transform"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="2"
                  width="3"
                  height="10"
                  rx="0.5"
                  fill="#181818"
                />
                <rect
                  x="8"
                  y="2"
                  width="3"
                  height="10"
                  rx="0.5"
                  fill="#181818"
                />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 2.5l7 4.5-7 4.5V2.5z" fill="#181818" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
            aria-label="Next track"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 3v10M3.5 3l6.5 5-6.5 5V3z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Repeat */}
          <button
            className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
            aria-label="Repeat"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5h10v2.5M13 11H3V8.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 3l2 2-2 2M5 9l-2 2 2 2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar Row */}
        <div className="flex max-w-[500px] w-[500px] items-center gap-3 relative flex-[0_0_auto]">
          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <div className="text-[10.5px] relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae] tracking-[0] leading-4 whitespace-nowrap">
              1:24
            </div>
          </div>

          <div
            ref={progressRef}
            className="flex h-1 items-center relative flex-1 grow bg-[#495565] rounded-[29826200px] cursor-pointer group"
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="relative self-stretch bg-white rounded-[29826200px] group-hover:bg-[#1db954] transition-colors"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
            <div className="text-[10.3px] relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae] tracking-[0] leading-4 whitespace-nowrap">
              3:45
            </div>
          </div>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex w-[482.67px] items-center justify-end gap-3 relative">
        {/* Lyrics */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
          aria-label="Lyrics"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="12"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <rect
              x="2"
              y="6.4"
              width="9"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <rect
              x="2"
              y="9.8"
              width="10"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <rect
              x="2"
              y="13.2"
              width="7"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Queue */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
          aria-label="Queue"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="3"
              width="12"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <rect
              x="2"
              y="6.4"
              width="12"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <rect
              x="2"
              y="9.8"
              width="8"
              height="1.2"
              rx="0.6"
              fill="currentColor"
            />
            <circle
              cx="12"
              cy="12"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M12 10.5v1.5l1 1"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Device */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
          aria-label="Connect to a device"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="8"
              height="6"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <rect
              x="6"
              y="9"
              width="8"
              height="5"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M5 8v1M11 8v1"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Volume */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
          aria-label="Volume"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3 6H1v4h2l4 3V3L3 6z" fill="currentColor" />
            <path
              d="M10 5.5a3 3 0 0 1 0 5M11.5 3.5a6 6 0 0 1 0 9"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Volume Slider */}
        <div className="flex items-center w-[93px] h-1 relative">
          <div className="flex h-1 items-center relative w-full bg-[#495565] rounded-[29826200px] cursor-pointer group">
            <div
              className="relative self-stretch bg-white rounded-[29826200px] group-hover:bg-[#1db954] transition-colors"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>

        {/* Full Screen */}
        <button
          className="flex items-center justify-center w-8 h-8 bg-transparent border-none cursor-pointer p-0 text-[#99a1ae] hover:text-white transition-colors"
          aria-label="Full screen"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};


ProfileContentSection.tsx


import { useState } from "react";
import button from "./button.svg";
import margin from "./margin.svg";
import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector4 from "./vector-4.svg";
import vector5 from "./vector-5.svg";
import vector6 from "./vector-6.svg";
import vector7 from "./vector-7.svg";
import vector8 from "./vector-8.svg";
import vector9 from "./vector-9.svg";
import vector10 from "./vector-10.svg";
import vector11 from "./vector-11.svg";
import vector12 from "./vector-12.svg";
import vector13 from "./vector-13.svg";
import vector14 from "./vector-14.svg";
import vector15 from "./vector-15.svg";

const tracks = [
  {
    id: 1,
    title: "One last time",
    artist: "Ariana Grande",
    plays: "14.12K",
    duration: "3:45",
    isActive: false,
    bgColor: "#0000ff",
    iconVec1: vector4,
    iconVec2: vector5,
    showHeart: false,
  },
  {
    id: 2,
    title: "One last time",
    artist: "Ariana Grande",
    plays: "14.12K",
    duration: "3:45",
    isActive: false,
    bgColor: "#0000ff",
    iconVec1: vector6,
    iconVec2: vector7,
    showHeart: false,
  },
  {
    id: 3,
    title: "One last time",
    artist: "Ariana Grande",
    plays: "14.12K",
    duration: "3:45",
    isActive: false,
    bgColor: "#0000ff",
    iconVec1: vector8,
    iconVec2: vector9,
    showHeart: false,
  },
  {
    id: 4,
    title: "One last time",
    artist: "Ariana Grande",
    plays: null,
    duration: null,
    isActive: true,
    bgColor: "black",
    iconVec1: vector10,
    iconVec2: vector11,
    showHeart: true,
  },
];

const tabs = ["Playlist", "Reposts", "Likes"];

export const ProfileContentSection = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState("Reposts");

  return (
    <div className="relative flex-1 self-stretch grow bg-[#121212] rounded-lg overflow-hidden">
      <div className="flex flex-col w-full h-[calc(100%_+_128px)] items-start absolute top-[65px] left-0 overflow-scroll">
        <div className="flex flex-col w-[1368.89px] items-start gap-6 relative flex-[0_0_auto]">
          <div className="h-[364.89px] border-[#fffefe0d] relative self-stretch w-full border-b-[0.89px] [border-bottom-style:solid]">
            <div className="inline-flex flex-col items-start pt-0 pb-2 px-0 absolute top-48 left-[647px]">
              <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Black',Helvetica] font-black text-white text-4xl tracking-[0] leading-10 whitespace-nowrap">
                PHT
              </div>
            </div>

            <div className="absolute top-60 left-[579px] w-[210px] h-11 flex">
              <div className="inline-flex mt-[-0.7px] w-[210.99px] h-5 relative items-start gap-[15.99px]">
                <div className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]">
                  <p className="text-[13.5px] relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-normal text-transparent tracking-[0] leading-5 whitespace-nowrap">
                    <span className="font-bold text-white">2511</span>
                    <span className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae]">
                      {" "}
                      Followers
                    </span>
                  </p>
                </div>

                <div className="inline-flex flex-col items-start relative self-stretch flex-[0_0_auto]">
                  <p className="text-[13.7px] relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-normal text-transparent tracking-[0] leading-5 whitespace-nowrap">
                    <span className="font-bold text-white">1412</span>
                    <span className="[font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae]">
                      {" "}
                      Following
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-4 absolute top-[284px] left-[calc(50.00%_-_120px)]">
              <button className="all-[unset] box-border inline-flex flex-col items-center justify-center px-6 py-2 relative flex-[0_0_auto] bg-[#fffefe1a] rounded-[29826200px]">
                <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13.7px] text-center tracking-[0] leading-5 whitespace-nowrap">
                  Edit profile
                </div>
              </button>

              <img className="relative w-10 h-10" alt="Button" src={button} />

              <div className="flex w-12 h-12 items-center justify-center pl-4 pr-3 py-0 relative bg-[#1db954] rounded-[29826200px] shadow-[0px_0px_20px_#1db9544c]">
                <div className="relative w-5 h-5">
                  <img
                    className="absolute w-[79.17%] h-[87.50%] top-[12.50%] left-[20.83%]"
                    alt="Vector"
                    src={vector2}
                  />
                </div>
              </div>
            </div>

            <img
              className="absolute top-12 left-[620px] w-32 h-36"
              alt="Margin"
              src={margin}
            />
          </div>

          <div className="flex flex-col items-start gap-6 px-8 py-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex h-[28.89px] items-end gap-8 border-[#fffefe1a] relative self-stretch w-full border-b-[0.89px] [border-bottom-style:solid]">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="all-[unset] box-border inline-flex flex-col items-center justify-center pt-0 pb-[8.66px] px-0 relative flex-[0_0_auto] mt-[-0.66px]"
                >
                  {tab === "Likes" ? (
                    <div className="relative w-[52.38px] h-7 flex items-center justify-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`[font-family:'Inter-Bold',Helvetica] font-bold text-sm text-center tracking-[0] leading-5 whitespace-nowrap ${
                            activeTab === tab ? "text-white" : "text-[#99a1ae]"
                          }`}
                        >
                          Likes
                        </span>
                        <div className="w-3 h-3 flex">
                          <img
                            className="flex-1 w-2.5"
                            alt="Vector"
                            src={vector3}
                          />
                        </div>
                      </div>
                      {activeTab === tab && (
                        <div className="absolute w-full left-0 bottom-0 h-0.5 bg-[#1db954]" />
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-[13.3px] text-center tracking-[0] leading-5 whitespace-nowrap ${
                          activeTab === tab ? "text-white" : "text-[#99a1ae]"
                        }`}
                      >
                        {tab}
                      </div>
                      {activeTab === tab && (
                        <div className="absolute w-full left-0 bottom-0 h-0.5 bg-[#1db954]" />
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-start gap-2 pt-0 pb-8 px-0 relative self-stretch w-full flex-[0_0_auto]">
              {tracks.map((track) =>
                track.isActive ? (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#1db8531a] rounded-xl"
                  >
                    <div className="flex w-12 h-12 items-center justify-center relative bg-black rounded">
                      <div className="relative w-7 h-7">
                        <img
                          className="absolute w-[62.50%] h-[66.67%] top-[33.33%] left-[37.50%]"
                          alt="Vector"
                          src={track.iconVec1}
                        />
                        <img
                          className="absolute w-[91.67%] h-[91.67%] top-[8.33%] left-[8.33%]"
                          alt="Vector"
                          src={track.iconVec2}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-start relative flex-1 grow">
                      <div className="relative self-stretch w-full h-5">
                        <div className="absolute -top-px left-0 w-[88px] h-5 flex items-center [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13.5px] tracking-[0] leading-5">
                          {track.title}
                        </div>
                      </div>
                      <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                        <div className="self-stretch relative flex items-center mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#99a1ae] text-[11.1px] tracking-[0] leading-4">
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    <div className="pl-0 pr-2 py-0 flex flex-col w-7 h-5 items-start relative">
                      <div className="flex flex-col w-5 h-5 items-start justify-center relative">
                        <div className="relative flex-1 w-5 grow">
                          <img
                            className="absolute w-[91.67%] h-[83.40%] top-[16.60%] left-[8.33%]"
                            alt="Vector"
                            src={vector12}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#1a1a1a] rounded-xl"
                  >
                    <div
                      className="relative w-12 h-12 rounded"
                      style={{ backgroundColor: track.bgColor }}
                    >
                      <div className="relative top-[calc(50.00%_-_24px)] h-12 bg-[#ffffff01] rounded shadow-[0px_1px_2px_-1px_#0000001a,0px_1px_3px_#0000001a]" />
                    </div>

                    <div className="flex flex-col items-start relative flex-1 grow">
                      <div className="relative self-stretch w-full h-5">
                        <div className="absolute -top-px left-0 w-[88px] h-5 flex items-center [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[13.5px] tracking-[0] leading-5">
                          {track.title}
                        </div>
                      </div>
                      <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
                        <div className="self-stretch relative flex items-center mt-[-1.00px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#99a1ae] text-[11.1px] tracking-[0] leading-4">
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                      <div className="relative w-3 h-3">
                        <img
                          className="absolute w-[91.67%] h-[91.67%] top-[8.33%] left-[8.33%]"
                          alt="Vector"
                          src={track.iconVec1}
                        />
                        <img
                          className="absolute w-[50.00%] h-[75.00%] top-[25.00%] left-[50.00%]"
                          alt="Vector"
                          src={track.iconVec2}
                        />
                      </div>

                      <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae] text-[10.7px] tracking-[0] leading-4 whitespace-nowrap">
                        {track.plays}
                      </div>

                      <div className="inline-flex flex-col items-start pl-2 pr-0 py-0 relative flex-[0_0_auto]">
                        <div className="text-[10.3px] relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#99a1ae] tracking-[0] leading-4 whitespace-nowrap">
                          {track.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-8 py-4 absolute top-0 left-0 bg-[#121111f2] border-b-[0.89px] [border-bottom-style:solid] border-[#fffefe0d] backdrop-blur-[6px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(6px)_brightness(100%)]">
        <div className="inline-flex items-start relative flex-[0_0_auto]">
          <div className="flex w-8 h-8 items-center justify-center relative bg-black rounded-[29826200px]">
            <div className="relative w-5 h-5">
              <img
                className="absolute w-[66.67%] h-[79.17%] top-[20.83%] left-[33.33%]"
                alt="Vector"
                src={vector13}
              />
            </div>
          </div>
        </div>

        <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
          <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[16.7px] tracking-[0] leading-7 whitespace-nowrap">
            Account
          </div>
        </div>

        <div className="flex w-8 h-8 items-center justify-center relative bg-[#1e1e1e] rounded-[29826200px]">
          <div className="relative w-[18px] h-[18px]">
            <img
              className="absolute w-[91.48%] h-[95.76%] top-[4.24%] left-[8.52%]"
              alt="Vector"
              src={vector14}
            />
            <img
              className="absolute w-[66.67%] h-[66.67%] top-[33.33%] left-[33.33%]"
              alt="Vector"
              src={vector15}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


SidebarNavigationSection.tsx

import image from "./image.svg";
import vector17 from "./vector-17.svg";
import vector18 from "./vector-18.svg";
import vector19 from "./vector-19.svg";
import vector20 from "./vector-20.svg";
import vector21 from "./vector-21.svg";
import vector22 from "./vector-22.svg";
import vector23 from "./vector-23.svg";
import vector24 from "./vector-24.svg";
import vector25 from "./vector-25.svg";
import vector26 from "./vector-26.svg";
import vector27 from "./vector-27.svg";
import vector28 from "./vector-28.svg";
import vector from "./vector.svg";

const primaryNavItems = [
  {
    label: "Trang chủ",
    active: true,
    icons: [
      {
        className: "absolute w-[66.67%] h-[54.17%] top-[45.83%] left-[33.33%]",
        src: vector18,
        alt: "Vector",
      },
      {
        className: "absolute w-[91.67%] h-[95.84%] top-[4.16%] left-[8.33%]",
        src: vector19,
        alt: "Vector",
      },
    ],
  },
  {
    label: "Tìm kiếm",
    active: false,
    icons: [
      {
        className: "absolute w-[34.75%] h-[34.75%] top-[65.25%] left-[65.25%]",
        src: vector20,
        alt: "Vector",
      },
      {
        className: "absolute w-[91.67%] h-[91.67%] top-[8.33%] left-[8.33%]",
        src: vector21,
        alt: "Vector",
      },
    ],
  },
  {
    label: "Thư viện",
    active: false,
    icons: [
      {
        className: "absolute w-[37.50%] h-[79.17%] top-[20.83%] left-[62.50%]",
        src: vector22,
        alt: "Vector",
      },
      {
        className: "absolute w-[54.17%] h-[79.17%] top-[20.83%] left-[45.83%]",
        src: vector23,
        alt: "Vector",
      },
      {
        className: "absolute w-[70.83%] h-[70.83%] top-[29.17%] left-[29.17%]",
        src: vector24,
        alt: "Vector",
      },
      {
        className: "absolute w-[87.50%] h-[87.50%] top-[12.50%] left-[12.50%]",
        src: vector25,
        alt: "Vector",
      },
    ],
  },
];

const secondaryNavItems = [
  {
    label: "Thông báo",
    active: false,
    icons: [
      {
        className: "absolute w-[61.38%] h-[16.67%] top-[83.33%] left-[38.62%]",
        src: vector26,
        alt: "Vector",
      },
      {
        className: "absolute w-[91.66%] h-[95.83%] top-[4.17%] left-[8.34%]",
        src: vector27,
        alt: "Vector",
      },
    ],
  },
  {
    label: "Tin nhắn",
    active: false,
    icons: [
      {
        className: "absolute w-[95.83%] h-[91.67%] top-[8.33%] left-[4.17%]",
        src: vector28,
        alt: "Vector",
      },
    ],
  },
  {
    label: "Hồ sơ (PHT)",
    active: true,
    icons: [
      {
        className: "absolute w-[83.33%] h-[41.67%] top-[58.33%] left-[16.67%]",
        src: vector,
        alt: "Vector",
      },
      {
        className: "absolute w-[70.83%] h-[91.67%] top-[8.33%] left-[29.17%]",
        src: image,
        alt: "Vector",
      },
    ],
  },
];

const labelTextSizes: Record<string, string> = {
  "Trang chủ": "text-[15.1px]",
  "Tìm kiếm": "text-[15.6px]",
  "Thư viện": "text-[15.1px]",
  "Thông báo": "text-[15.5px]",
  "Tin nhắn": "text-[15.5px]",
  "Hồ sơ (PHT)": "text-[15.5px]",
};

export const SidebarNavigationSection = (): JSX.Element => {
  return (
    <div className="flex flex-col w-64 items-start p-6 relative self-stretch bg-[#121212] rounded-lg">
      <div className="flex flex-col items-start pt-0 pb-8 px-0 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex items-center gap-2 relative self-stretch w-full flex-[0_0_auto]">
          <div className="flex w-8 h-8 items-center justify-center pl-[9px] pr-[7px] py-0 relative bg-[#1db954] rounded-[29826200px]">
            <div className="relative w-4 h-4">
              <img
                className="absolute w-[83.33%] h-[91.67%] top-[8.33%] left-[16.67%]"
                alt="Vector"
                src={vector17}
              />
            </div>
          </div>

          <div className="inline-flex flex-col items-start pt-0 pb-[0.67px] px-0 relative flex-[0_0_auto]">
            <div className="relative flex items-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[19.1px] tracking-[-0.50px] leading-7 whitespace-nowrap">
              PrimeSound
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col items-start gap-[19.6px] relative flex-1 self-stretch w-full grow">
        {primaryNavItems.map((item) => (
          <button
            key={item.label}
            className="all-[unset] box-border flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]"
          >
            <div className="relative w-[22px] h-[22px]">
              {item.icons.map((icon, idx) => (
                <img
                  key={idx}
                  className={icon.className}
                  alt={icon.alt}
                  src={icon.src}
                />
              ))}
            </div>

            <div
              className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold ${
                item.active ? "text-white" : "text-[#99a1ae]"
              } ${labelTextSizes[item.label]} text-center tracking-[0] leading-6 whitespace-nowrap`}
            >
              {item.label}
            </div>
          </button>
        ))}

        <div className="flex flex-col items-start gap-[19.6px] pt-6 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto] border-t-[0.89px] [border-top-style:solid] border-[#fffefe1a]">
          {secondaryNavItems.map((item) => (
            <button
              key={item.label}
              className="all-[unset] box-border flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto]"
            >
              <div className="relative w-[22px] h-[22px]">
                {item.icons.map((icon, idx) => (
                  <img
                    key={idx}
                    className={icon.className}
                    alt={icon.alt}
                    src={icon.src}
                  />
                ))}
              </div>

              <div
                className={`relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Inter-Bold',Helvetica] font-bold ${
                  item.active ? "text-[#1db954]" : "text-[#99a1ae]"
                } ${labelTextSizes[item.label]} text-center tracking-[0] leading-6 whitespace-nowrap`}
              >
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};


tailwind.css


@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  button,
  input,
  select,
  textarea {
    @apply appearance-none bg-transparent border-0 outline-none;
  }
}

@tailwind components;
@tailwind utilities;

@layer components {
  .all-\[unset\] {
    all: unset;
  }
}

:root {
  --animate-spin: spin 1s linear infinite;
}

.animate-fade-in {
  animation: fade-in 1s var(--animation-delay, 0s) ease forwards;
}

.animate-fade-up {
  animation: fade-up 1s var(--animation-delay, 0s) ease forwards;
}

.animate-marquee {
  animation: marquee var(--duration) infinite linear;
}

.animate-marquee-vertical {
  animation: marquee-vertical var(--duration) linear infinite;
}

.animate-shimmer {
  animation: shimmer 8s infinite;
}

.animate-spin {
  animation: var(--animate-spin);
}

@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes image-glow {
  0% {
    opacity: 0;
    animation-timing-function: cubic-bezier(0.74, 0.25, 0.76, 1);
  }

  10% {
    opacity: 0.7;
    animation-timing-function: cubic-bezier(0.12, 0.01, 0.08, 0.99);
  }

  to {
    opacity: 0.4;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes shimmer {
  0%,
  90%,
  to {
    background-position: calc(-100% - var(--shimmer-width)) 0;
  }

  30%,
  60% {
    background-position: calc(100% + var(--shimmer-width)) 0;
  }
}

@keyframes marquee {
  0% {
    transform: translate(0);
  }

  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes marquee-vertical {
  0% {
    transform: translateY(0);
  }

  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
