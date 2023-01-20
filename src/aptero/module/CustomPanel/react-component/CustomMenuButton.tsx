import React from "react";
import { ReactComponent as ObjectsIcon } from "../../../../react-components/icons/Objects.svg";
import { customMenuService } from "../../../module/CustomPanel/CustomMenuService";
import { ContentMenuButton } from "../../../../react-components/room/ContentMenu";
export function CustomMenuButton(props: JSX.IntrinsicAttributes & { [x: string]: any; active: any; children: any }) {
  if (customMenuService.isActivated()) {
    const title = customMenuService.getButtonTitle();
    return (
      <ContentMenuButton {...props}>
        <ObjectsIcon />
        <span>{title}</span>
      </ContentMenuButton>
    );
  } else {
    return <></>;
  }
}
