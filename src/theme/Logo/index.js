import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useThemeConfig } from "@docusaurus/theme-common";
import ThemedImage from "@theme/ThemedImage";

function LogoThemedImage({ logo, alt, imageClassName }) {
  const sources = {
    light: useBaseUrl(logo.src),
    dark: useBaseUrl(logo.srcDark || logo.src),
  };
  const themedImage = (
    <ThemedImage
      className={logo.className}
      sources={sources}
      height={logo.height}
      width={logo.width}
      alt={alt}
      style={logo.style}
    />
  );
  // Is this extra div really necessary?
  // introduced in https://github.com/facebook/docusaurus/pull/5666
  return imageClassName ? (
    <div className={imageClassName}>{themedImage}</div>
  ) : (
    themedImage
  );
}

export default function Logo(props) {
  const {
    siteConfig: { title },
  } = useDocusaurusContext();
  const {
    navbar: { title: navbarTitle, logo },
  } = useThemeConfig();
  const { imageClassName, titleClassName, ...propsRest } = props;
  const logoLink = useBaseUrl(logo?.href || "/");
  // If visible title is shown, fallback alt text should be
  // an empty string to mark the logo as decorative.
  const fallbackAlt = navbarTitle ? "" : title;
  // Use logo alt text if provided (including empty string),
  // and provide a sensible fallback otherwise.
  const alt = logo?.alt ?? fallbackAlt;
  return (
    <Link
      to={logoLink}
      {...propsRest}
      {...(logo?.target && { target: logo.target })}
    >
      <svg
        width="40"
        height="27"
        viewBox="0 0 40 27"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: 10 }}
      >
        {false ? { color: "#d35e36" } : null}
        <g fill="none">
          <path
            fill="#f58962"
            d="M0 13.343 13.343 0l13.343 13.343-13.343 13.343z"
          ></path>
          <path
            fill="#f58962"
            d="M12.137 13.346 25.48.003l13.343 13.343L25.48 26.69z"
          ></path>
          <path
            fill="#d35e36"
            d="m12.104 13.348 7.311-7.311 7.312 7.311-7.312 7.312z"
          ></path>
        </g>
      </svg>
      {navbarTitle != null && <b className={titleClassName}>{navbarTitle}</b>}
    </Link>
  );
}
