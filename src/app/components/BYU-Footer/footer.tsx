import Link from "next/link";
import Image from "next/image";
import byuLogo from "@/public/byuLogoWhiteSmall.svg";

const Footer = () => {
  return (
    <footer className="bg-byu-navy text-white text-center py-6 px-4">
      <div className="space-y-1">
        {/* Responsive Logo/Title */}
        <div>
          {/* Show BYU logo on md only */}
          <Image
            src={byuLogo}
            alt="BYU Logo"
            className="mx-auto h-6 w-auto block md:block lg:hidden"
          />

          {/* Show full name on lg+ only */}
          <h1 className="hidden lg:block text-sm sm:text-base font-bold tracking-widest uppercase">
            Brigham Young University
          </h1>
        </div>

        {/* Info line */}
        <p className="text-sm sm:text-base font-normal">
          <span>Provo, UT 84602, USA</span>
          <span className="mx-2">|</span>
          <Link href="tel:8014224636" className="hover:underline">
            801-422-4636
          </Link>
          <span className="mx-2">|</span>
          <span>2025 © All Rights Reserved</span>
        </p>

        {/* Links */}
        <div className="text-sm sm:text-base font-normal space-x-2">
          <Link href="https://privacy.byu.edu" className="hover:underline">
            Privacy Notice
          </Link>
          <span>|</span>
          <Link
            href="https://privacy.byu.edu/cookie-prefs"
            className="hover:underline"
          >
            Cookie Preferences
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
