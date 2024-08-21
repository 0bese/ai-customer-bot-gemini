import React from "react";
import markdownit from "markdown-it";
import DOMPurify from "isomorphic-dompurify";

const Markdown = ({ text }) => {
  const md = markdownit();
  const htmlContent = md.render(text);

  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }}></div>;
};

export default Markdown;
