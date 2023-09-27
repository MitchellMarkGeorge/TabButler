import { Props, SearchModal } from "./ui/components/SearchModal";
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";

export class SearchUIHandler {
  private props!: Props;
  private root: Root | null = null;
  private isMounted = false;

  public mount(domNode: Element | DocumentFragment, props: Props) {
    if (!this.isMounted) {
      this.root = createRoot(domNode);
      this.props = props;
      this.render();
      this.isMounted = true;
    }
  }

  private render() {
    const searchComponentInstance = createElement(SearchModal, this.props);
    this.root?.render(searchComponentInstance);
  }

  public updateProps(props: Partial<Props>) {
    if (this.isMounted) {
      Object.assign(this.props, props);
      this.render();
    }
  }

  public getProps() {
    return this.props;
  }

  public unMount() {
    if (this.isMounted) {
      this.root?.unmount();
      this.root = null;
      this.isMounted = false;
    }
  }
}
