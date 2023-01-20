import React, { useEffect } from "react";
import { Sidebar } from "../../../../react-components/sidebar/Sidebar";
import { CloseButton } from "../../../../react-components/input/CloseButton";
import { ClonesI, getClones } from "../LoadBalancer";
import { List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import InboxIcon from "@material-ui/icons/Inbox";
export function InstancesSidebarContainer({ onClose }: any) {
  const [instances, setInstances] = React.useState<ClonesI>({});
  useEffect(() => {
    (async () => {
      const instances = (await getClones()).clones;
      setInstances(instances);
    })();
  }, []);

  let totalPeople = 0;
  let totalMaxPeople = 0;
  for (const instancesKey in instances) {
    const instance = instances[instancesKey];
    totalMaxPeople += instance.peopleMax;
    totalPeople += instance.people;
  }

  return (
    <Sidebar
      title={`Instances (${totalPeople}/${totalMaxPeople})`}
      beforeTitle={<CloseButton onClick={onClose} lg={undefined} className={undefined} />}
    >
      <List>
        {Object.keys(instances).map(value => {
          const instance = instances[value];
          const line = instance.name + " (" + instance.people + "/" + instance.peopleMax + ")";
          return (
            <ListItem
              button
              key={value}
              onClick={async () => {
                // move to new room without page load or entry flow
                const { changeHub } = await import("../../../../change-hub");
                changeHub(value);
                onClose();
              }}
            >
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary={instance.current ? <b>{line}</b> : line} />
            </ListItem>
          );
        })}
      </List>
    </Sidebar>
  );
}
