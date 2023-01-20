import * as React from "react";
import { useCallback, useContext, useState } from "react";
import { FormattedMessage } from "react-intl";

import { Button, Input } from "@fluentui/react-northstar";
import { MediaGrid } from "./hubs/react-components/room/MediaGrid";
import { usePaginatedAPI } from "./hubs/react-components/home/usePaginatedAPI";
import { Container } from "./hubs/react-components/layout/Container";
import { Column } from "./hubs/react-components/layout/Column";
import { AuthContext } from "../../../../react-components/auth/AuthContext";
import { MediaTile } from "../../../../react-components/room/MediaTiles";
import { PadNumber } from "./PadNumber";
import { getServiceSync } from "@aptero/axolotis-player";
import { ROOM_SERVICE, roomService, RoomService } from "../../axolotis/modules/basic";
import { msTeamsAPI } from "@aptero/axolotis-module-teams";

//https://fluentsite.z22.web.core.windows.net/0.60.1

export function roomServiceSync(): RoomService {
  return getServiceSync<RoomService>(ROOM_SERVICE);
}

declare const window: Window;

function useSpokeProject() {
  const auth: any = useContext(AuthContext); // Re-render when you log in/out.
  if (auth) {
    // eslint-disable-next-line react-hooks/exhaustive-deps,react-hooks/rules-of-hooks
    const getMoreRooms = useCallback(roomServiceSync().fetchSpokeProject(auth.userId), [auth.userId]);
    return usePaginatedAPI(getMoreRooms);
  } else {
    return { results: [] };
  }
}

function useFavoriteRooms() {
  const auth: any = useContext(AuthContext); // Re-render when you log in/out.
  if (auth) {
    const getMoreRooms = useCallback(roomServiceSync().fetchFavoriteRoom(auth.userId), [auth.userId]);
    return usePaginatedAPI(getMoreRooms);
  } else {
    return { results: [] };
  }
}

export function RoomSection(props: {
  roomUrl: string;
  suggestedDisplayName: string;
  onChangeSuggestedDisplayName: (text: string) => void;
  onChangeRoomUrl: (text: string) => void;
}) {
  const [currentTab, setTab] = useState("featured");
  const { results: favoriteRooms } = useFavoriteRooms() as any;
  const { results: spokeProject } = useSpokeProject();

  const sortedFeaturedScene = [
    {
      onClick: async () => {
        await (await msTeamsAPI()).changeUrlSettings("https://meet.aptero.co/q2XuoUT/tutorial-room?offline2=true");
      },
      entry: roomServiceSync().createRoomEntry(
        "Tutorial Space",
        "",
        "https://files.aptero.co/api/public/dl/DHeO0e4p?inline=true"
      )
    },
    {
      onClick: async () => {
        const url = await (await roomService()).createAndSelect("ttQn7dJ");
        console.log("created room : " + url);
        await (await msTeamsAPI()).changeUrlSettings(url);
      },
      entry: roomServiceSync().createRoomEntry(
        "Event",
        "",
        "https://meet.aptero.co/files/ddce4f1e-7794-4f1f-87bc-19ec991adc19.jpg"
      )
    },
    {
      onClick: async () => {
        const url = await (await roomService()).createAndSelect("HkZhZjU");
        console.log("created room : " + url);
        await (await msTeamsAPI()).changeUrlSettings(url);
      },
      entry: roomServiceSync().createRoomEntry(
        "Virtual Meeting",
        "",
        "https://meet.aptero.co/files/38a5ab95-9d64-4c57-89a3-dcd53d63d4b8.jpg"
      )
    },
    {
      /*onClick : async ()=>{
        await (await msTeamsAPI()).changeUrlSettings("https://microverse.aptero.co/");
      },*/

      onClick: async () => {
        const url = await (await roomService()).createAndSelect("CRWmD8C");
        console.log("created room : " + url);
        await (await msTeamsAPI()).changeUrlSettings(url);
      },
      entry: roomServiceSync().createRoomEntry(
        "Virtual Amphitheater",
        "",
        "https://meet.aptero.co/files/bf2638b2-a5ce-4a88-aa35-bed41717a741.jpg"
      )
    }
  ];
  const sortedFavoriteRooms = Array.from(favoriteRooms).sort((a: any, b: any) => b.member_count - a.member_count);
  const sortedSpokeProject = Array.from(spokeProject).sort((a: any, b: any) => b.member_count - a.member_count);

  const mySceneDisplay = sortedSpokeProject.length > 0;
  const myRoomDisplay = sortedFavoriteRooms.length > 0;
  const Column2: any = Column;
  return (
    <>
      <h2>
        <FormattedMessage id="microsoft.settings.room" defaultMessage="Room" />
      </h2>
      {props.roomUrl && (
        <>
          <Input
            label={<FormattedMessage id="microsoft.settings.room-display-name" defaultMessage="Room Display Name" />}
            fluid
            value={props.suggestedDisplayName}
            onChange={value => {
              props.onChangeSuggestedDisplayName((value.target as any).value);
            }}
          />
          <Input
            label={<FormattedMessage id="microsoft.settings.selected-room" defaultMessage="Selected Room" />}
            fluid
            value={props.roomUrl}
            onChange={value => {
              props.onChangeRoomUrl((value.target as any).value);
            }}
          />
          <Button
            fluid
            onClick={() => {
              props.onChangeRoomUrl("");
            }}
          >
            <FormattedMessage id="microsoft.settings.change-scene" defaultMessage="Change Scene" />
          </Button>
        </>
      )}
      {!props.roomUrl && (
        <>
          <div style={{ padding: 10, display: "flex", justifyContent: "space-evenly" }}>
            <Button
              style={{ margin: 10 }}
              primary={currentTab === "featured"}
              onClick={() => {
                setTab("featured");
              }}
            >
              <FormattedMessage id="microsoft-settings-page.featured" defaultMessage="Featured" />
            </Button>
            {mySceneDisplay && (
              <Button
                style={{ margin: 10 }}
                primary={currentTab === "my-scene"}
                onClick={() => {
                  setTab("my-scene");
                }}
              >
                <FormattedMessage id="microsoft-settings-page.create" defaultMessage="My Scene" />
              </Button>
            )}
            {myRoomDisplay && (
              <Button
                style={{ margin: 10 }}
                primary={currentTab === "my-room"}
                onClick={() => {
                  setTab("my-room");
                }}
              >
                <FormattedMessage id="microsoft-settings-page.my-scene" defaultMessage="My Room" />
              </Button>
            )}
            <Button
              style={{ margin: 10 }}
              primary={currentTab === "room-code"}
              onClick={() => {
                setTab("room-code");
              }}
            >
              <FormattedMessage id="microsoft-settings-page.room-code" defaultMessage="Room Code" />
            </Button>
          </div>
          {currentTab === "featured" && sortedFeaturedScene.length > 0 && (
            <Container as={undefined} className={undefined}>
              <Column2 grow padding>
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedFeaturedScene.map((room, index) => {
                    return (
                      <MediaTile
                        onClick={async (event: Event) => {
                          event.preventDefault();
                          await room.onClick();
                        }}
                        onEdit={(event: Event) => {
                          event.preventDefault();
                          console.log("edit : " + room.entry.id);
                        }}
                        key={index}
                        entry={room.entry}
                        processThumbnailUrl={(
                          entry: { images: { preview: { url: any } } },
                          /* eslint-disable-next-line no-unused-vars */
                          width: any,
                          /* eslint-disable-next-line no-unused-vars */
                          height: any
                        ) => {
                          //TODO add a thumbnail service here
                          return entry.images.preview.url;
                        }}
                        onShowSimilar={undefined}
                        onCopy={undefined}
                        onInfo={undefined}
                      />
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          {currentTab === "my-scene" && sortedSpokeProject.length > 0 && (
            <Container as={undefined} className={undefined}>
              <Column2 grow padding>
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedSpokeProject.map((room: any) => {
                    return (
                      <MediaTile
                        onClick={async (event: Event) => {
                          event.preventDefault();
                          const url = await (await roomService()).createAndSelect(room.id);
                          console.log("created room : " + url);
                          await (await msTeamsAPI()).changeUrlSettings(url);
                        }}
                        onEdit={(event: Event) => {
                          event.preventDefault();
                          console.log("edit : " + room.id);
                        }}
                        key={room.id}
                        entry={room}
                        /* eslint-disable-next-line no-unused-vars */
                        processThumbnailUrl={(entry: { images: { preview: { url: any } } }, width: any, height: any) =>
                          entry.images.preview.url
                        }
                        onShowSimilar={undefined}
                        onCopy={undefined}
                        onInfo={undefined}
                      />
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          {currentTab === "my-room" && sortedFavoriteRooms.length > 0 && (
            <Container className={undefined} as={undefined}>
              <Column2 grow padding>
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedFavoriteRooms.map((room: any) => {
                    return (
                      <MediaTile
                        onClick={async (event: Event) => {
                          event.preventDefault();
                          let roomurl = window.location.origin + "/" + room.id;
                          if (window.location.origin.startsWith("https://localhost")) {
                            roomurl = window.location.origin + "/hub.html?hub_id=" + room.id;
                          }
                          await (await msTeamsAPI()).changeUrlSettings(roomurl);
                        }}
                        key={room.id}
                        entry={room}
                        /* eslint-disable-next-line no-unused-vars */
                        processThumbnailUrl={(entry: { images: { preview: { url: any } } }, width: any, height: any) =>
                          entry.images.preview.url
                        }
                        onEdit={undefined}
                        onShowSimilar={undefined}
                        onCopy={undefined}
                        onInfo={undefined}
                      />
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          {currentTab === "room-code" && (
            <Container className={undefined} as={undefined}>
              <Column2 grow padding>
                <PadNumber
                  execute={async code => {
                    const url = await (await roomService()).getLinkFromCode(code);
                    await (await msTeamsAPI()).changeUrlSettings(url);
                  }}
                />
              </Column2>
            </Container>
          )}
        </>
      )}
    </>
  );
}
