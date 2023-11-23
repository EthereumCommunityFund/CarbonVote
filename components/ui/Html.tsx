interface HTMLStringProps {
  htmlString: string;
  height?: string;
}

export default function HtmlString({ htmlString, height }: HTMLStringProps): JSX.Element {
  const removeStyleAttribute = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const elementsWithStyle = doc.querySelectorAll('*[style]');

    elementsWithStyle.forEach((element) => {
      element.removeAttribute('style');
    });

    return doc.body.innerHTML;
  };
  const sanitizedHTML = removeStyleAttribute(htmlString);

  return (
    <div className={`overflow-y-auto text-white md:w-full`} dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
  );
}
