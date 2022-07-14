import { Props, Search } from "./components/Search";
import * as ReactDOM from "react-dom/client";
import React from "react";

export class SearchUIHandler {
  private props!: Props;
  private root: ReactDOM.Root | null = null;
  private isMounted = false;

  public mount(domNode: Element | DocumentFragment, props: Props) {
    if (!this.isMounted) {
      this.root = ReactDOM.createRoot(domNode);
      this.props = props;
      this.render();
      this.isMounted = true;
    }
  }

  private render() {
    const searchComponentInstance = React.createElement(Search, this.props);
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
