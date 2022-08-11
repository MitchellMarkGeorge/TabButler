import { HTMLAttributes, ElementType, forwardRef, createElement } from "react";

// a small utility function to create compoenents with a classname and a tagname
// element specific props?
export const createComponent = (
  className: string,
  tagName: ElementType = "div",
) => {
  return forwardRef((props: HTMLAttributes<HTMLOrSVGElement>, ref) => {
    return createElement(tagName, { ...props, className, ref });
  });
};

// what file should these components go to
export const Empty = createComponent("tab-butler-empty");
export const Heading = createComponent("tab-butler-heading", "h1");
export const ModalBody = createComponent("tab-butler-modal-body");
