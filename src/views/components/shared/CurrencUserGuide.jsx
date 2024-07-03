import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FileSaver from "file-saver";

const CurrencUserGuide = ({ role, label }) => {
  const { t } = useTranslation();

  const manuelsMatch = {
    "admin-pro":
      "assets/media/files/2207_DMD_RD_Guide-SatisPro_Profil-Admin.pdf",
    pilot: "assets/media/files/2207_DMD_RD_Guide-SatisPro_Profil-Pilote.pdf",
    staff: "assets/media/files/2207_DMD_RD_Guide-SatisPro_Profil-Analyste.pdf",
    "collector-filial-pro":
      "assets/media/files/2207_DMD_RD_Guide-SatisPro_Profil-Collecteur.pdf",
  };

  const getGuidePath = (role) => {
    let path = manuelsMatch[role];
    if (!path) {
      path = manuelsMatch.staff;
    }
    return path;
  };

  const actDownload = (role) => {
    FileSaver.saveAs(
      getGuidePath(role),
      `guide_${role}_${new Date().getFullYear()}.pdf`
    );
  };

  let isListed = manuelsMatch[role];
  if (!isListed) {
    return null;
  }

  return (
    <NavLink
      exact
      to={`${getGuidePath(role)}`}
      className="kt-menu__item "
      activeClassName="kt-menu__item--active"
      aria-haspopup="true"
      onClick={(e) => {
        e.preventDefault();
        actDownload(role);
      }}
    >
      <li className="kt-menu__link ">
        <i className="kt-menu__link-bullet kt-menu__link-bullet--dot">
          <span />
        </i>
        <span className="kt-menu__link-text">{t(label)}</span>
      </li>
    </NavLink>
  );
};

export default CurrencUserGuide;
