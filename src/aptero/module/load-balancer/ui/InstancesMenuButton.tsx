import React from "react";
import { ReactComponent as ObjectsIcon } from "../../../../react-components/icons/Scene.svg";
import { customMenuService } from "../../../module/CustomPanel/CustomMenuService";
import { ContentMenuButton } from "../../../../react-components/room/ContentMenu";
import { hasInstances } from "../LoadBalancer";

export function InstancesMenuButton(props: any) {
  if (hasInstances()) {
    return (
      <ContentMenuButton {...props}>
        <ObjectsIcon />
        {/* TODO Fix translations */}
        {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message,react/no-unescaped-entities */}
        <span>"Instances"</span>
      </ContentMenuButton>
    );
  } else {
    return <></>;
  }
}
