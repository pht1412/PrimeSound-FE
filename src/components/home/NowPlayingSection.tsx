import wizkidMadeInLagosAlbum2 from "./wizkid-made-in-lagos-album-2.png";
import type { JSX } from "react/jsx-dev-runtime";


export const NowPlayingSection = (): JSX.Element => {
  return (
    <div className="inline-flex flex-col items-center gap-[21px] absolute top-[494px] left-[1125px]">
      <img
        className="relative w-[242px] h-[242px] object-cover"
        alt="Wizkid made in lagos"
        src={wizkidMadeInLagosAlbum2}
      />

      <div className="inline-flex flex-col items-center relative flex-[0_0_auto]">
        <div className="text-xl relative w-fit mt-[-1.00px] [font-family:'Poppins-Bold',Helvetica] font-bold text-white tracking-[0] leading-[normal]">
          Wizkid
        </div>

        <div className="relative w-fit [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-[15px] tracking-[0] leading-[normal]">
          Made in Lagos
        </div>
      </div>
    </div>
  );
};