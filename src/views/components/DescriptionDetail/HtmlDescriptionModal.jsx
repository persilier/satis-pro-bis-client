import React, {useRef, useEffect} from "react";
import ModalContainer from "../Modal/ModalContainer";
import ModalCloseButton from "../Modal/ModalCloseButton";
import ModalFooter from "../Modal/ModalFooter";
import ModalCloseIcon from "../Modal/ModalCloseIcon";
import ModalHead from "../Modal/ModalHead";
import ModalTitle from "../Modal/ModalTitle";
import ModalBody from "../Modal/ModalBody";



const HtmlDescriptionModal = ({message, title = "Message"}) => {
    const element = useRef(null);

    useEffect(() => {
        element.current.innerHTML = '';
        const iframe = document.createElement('iframe');
        element.current.appendChild(iframe);
        iframe.width = "100%";
        iframe.height = "100%"
        iframe.setAttribute("style","overflow-y: auto");
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(message);
        iframe.contentWindow.document.close();
    }, [message]);

    return (

        <ModalContainer modalId="message_email">
            <ModalHead>
                <ModalTitle>{title}</ModalTitle>
                <ModalCloseIcon/>
            </ModalHead>

            <ModalBody>
                <div ref={element} style={{width: "100%", height: "350px"}}/>
            </ModalBody>

            <ModalFooter>
                <ModalCloseButton>Fermer</ModalCloseButton>
            </ModalFooter>
        </ModalContainer>

    );
};

export default HtmlDescriptionModal;