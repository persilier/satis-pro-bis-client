import React, {useRef, useEffect, useState} from "react";
import ModalContainer from "../Modal/ModalContainer";
import ModalCloseIcon from "../Modal/ModalCloseIcon";
import ModalCloseButton from "../Modal/ModalCloseButton";
import ModalFooter from "../Modal/ModalFooter";
import ModalHead from "../Modal/ModalHead";
import ModalTitle from "../Modal/ModalTitle";
import ModalBody from "../Modal/ModalBody";
import EmptyTable from "../EmptyTable";
import axios from "axios";
import appConfig from "../../../config/appConfig";
import {useTranslation} from "react-i18next";
import {verifyTokenExpire} from "../../../middleware/verifyToken";

const MemberDescriptionModal = ({message, title = "Message"}) => {
    const element = useRef(null);

    const [memberList, setMemberList] = useState(message);

    const [members, setMembers] = useState([]);
    const [showList, setShowList] = useState([]);

    const {t, ready} = useTranslation();


    useEffect(() => {
        setMemberList(message);
    }, [message]);

    const printBodyTable = (member, index) => {
        return (

            <tr key={index} role="row" className="odd">

                <td>{`${(member.identite && member.identite.lastname) ? member.identite.lastname : ''} ${(member.identite && member.identite.firstname) ? member.identite.firstname : ''}`}</td>

                <td>{`${member.unit && member.unit.name["fr"] ? member.unit.name["fr"] : "-"}`}</td>

                <td> {`${member.position && member.position.name["fr"] ? member.position.name["fr"] : "-"}`}</td>

            </tr>
        );
    };

    return (

        <ModalContainer modalId="member">
            <ModalHead>
                <ModalTitle>{title}</ModalTitle>
                <ModalCloseIcon/>
            </ModalHead>

            <ModalBody>
                <div className="row">
                    <div className="col-sm-12">
                        <table
                            className="table table-striped table-bordered table-hover table-checkable dataTable dtr-inline"
                            id="myTable" role="grid" aria-describedby="kt_table_1_info"
                            style={{width: "952px"}}>
                            <thead>
                            <tr role="row">
                                <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                    rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                    aria-label="Country: activate to sort column ascending">
                                    {t("Membres du comité")}
                                </th>
                                <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                    rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                    aria-label="Country: activate to sort column ascending">
                                    {t("Unité de l'agent")}
                                </th>
                                <th className="sorting" tabIndex="0" aria-controls="kt_table_1"
                                    rowSpan="1" colSpan="1" style={{width: "70.25px"}}
                                    aria-label="Country: activate to sort column ascending">
                                    {t("Fonctions")}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                    memberList.length ? (
                                        memberList.map((member, index) => (
                                            printBodyTable(member, index)
                                        ))
                                    ) : (
                                        <EmptyTable/>
                                    )

                            }
                            </tbody>
                            <tfoot>
                            <tr>
                                <th rowSpan="1" colSpan="1">{t("Membres du comité")}</th>
                                <th rowSpan="1" colSpan="1">{t("Unité de l'agent")}</th>
                                <th rowSpan="1" colSpan="1">{t("Fonctions")}</th></tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

            </ModalBody>

            <ModalFooter>
                <ModalCloseButton> {t("Fermer")}</ModalCloseButton>
            </ModalFooter>
        </ModalContainer>

    );
};

export default MemberDescriptionModal;