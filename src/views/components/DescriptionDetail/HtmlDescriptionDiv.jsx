import React, {useRef, useEffect} from "react";

const HtmlDescriptionDiv = ({message, title = "Message"}) => {
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
        <div ref={element} style={{width: "100%", height: "200px"}}/>
    );
};

export default HtmlDescriptionDiv;