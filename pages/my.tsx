import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import AppBar from "../components/AppBar";
import { MainContainer } from "./chat/style";
import { dbService } from "../utils/fbase";
import { SavedChatType, useChatStore } from "../utils/store";
import styled from "@emotion/styled";
import BotChat, { CustomSwipeSlide } from "./chat/BotChat";
import { DomainOne } from "../utils/persona";
import UserChat, { UserChatWrapper } from "./chat/UserChat";
import { Button, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import Image from "next/image";

const LOADONENUM = 2;

const MyPage: NextPage = () => {
  const [radio, setRadio] = useState<"found" | "saved">("found");
  const [saves, setSaves] = useState<SavedChatType[]>();
  const [asks, setAsks] = useState<any>();
  const [pagi, setPagi] = useState<number>(1);
  const [readed, setReaded] = useState<string[]>([]);
  const { user } = useChatStore();

  useEffect(() => {
    // get saved chats 시간순으로
    setPagi(1);
    init();
    const readIds = localStorage.getItem("read");
    if (readIds) {
      setReaded(JSON.parse(readIds));
    }
  }, []);

  const init = async () => {
    await dbService
      .collection("chats")
      .where("uid", "==", user?.uid)
      .where("saved", "array-contains-any", [0, 1, 2, 3, 4, 5, 6, 7, 8])
      .orderBy("createdAt")
      .startAfter(pagi)
      .limit(LOADONENUM)
      .get()
      .then((res) => {
        const response = res.docs.map((doc) => {
          return { ...(doc.data() as SavedChatType), id: doc.id };
        });
        if (saves) setSaves([...saves, ...response]);
        else setSaves(response);

        if (response.length < LOADONENUM) setPagi(0);
        else setPagi(response.slice(-1)[0].createdAt);
      });

    await dbService
      .collection("chats")
      .where("uid", "==", user?.uid)
      .where("asked", "==", "found")
      .orderBy("createdAt", "asc")
      .get()
      .then((res) => {
        const response = res.docs.map((doc) => {
          return { ...(doc.data() as SavedChatType), id: doc.id };
        });
        localStorage.setItem(
          "read",
          JSON.stringify(response.map((item) => item.id))
        );
        setAsks(response);
      });
  };

  return (
    <>
      <AppBar page="my" radio={radio} onClick={setRadio} />
      <MainContainer>
        <MyPageConainer>
          {radio === "saved" && (
            <SavedContainer>
              {saves ? (
                <>
                  {saves.map((item, i) => {
                    return (
                      <>
                        {item.saved.map((doc: number) => {
                          return (
                            <SavedContent
                              key={`key_${i}${doc}`}
                              className="card">
                              <UserChat
                                text={item.query as string}
                                displayName={item.displayName}
                                photoURL={item.photoURL}
                              />
                              <BotChat
                                item={item}
                                savedIndex={doc}
                                saves={saves}
                                setSaves={setSaves}
                              />
                            </SavedContent>
                          );
                        })}
                      </>
                    );
                  })}
                </>
              ) : (
                <ChatSkeleton />
              )}
              {pagi !== 0 && (
                <LoadMoreButton pt={4} pb={4} onClick={() => init()}>
                  Load more
                </LoadMoreButton>
              )}
              {saves && saves.length === 0 && <EmptyThing text="save" />}
            </SavedContainer>
          )}
          {radio === "found" && (
            <SavedContainer>
              {asks ? (
                <>
                  {asks.map((item: any, i: number) => {
                    return (
                      <>
                        <SavedContent
                          key={`key_${i}`}
                          className="card"
                          isNew={!readed.includes(item.id as string)}>
                          <UserChat
                            text={item.query as string}
                            displayName={item.displayName}
                            photoURL={item.photoURL}
                          />
                          <BotChat
                            item={item}
                            saves={asks}
                            savedIndex={item.text.length - 1}
                            setSaves={setAsks}
                          />
                        </SavedContent>
                      </>
                    );
                  })}
                </>
              ) : (
                <ChatSkeleton />
              )}
              {asks && asks.length === 0 && <EmptyThing text="ask for" />}
            </SavedContainer>
          )}
        </MyPageConainer>
      </MainContainer>
    </>
  );
};

export default MyPage;

const ChatSkeleton = () => {
  return (
    <UserChatWrapper
      spaceBetween={26}
      slidesPerView={1}
      allowTouchMove={false}
      scrollbar={{ draggable: true }}>
      <CustomSwipeSlide>
        <div className="innerd">
          <div className="profile">
            <SkeletonCircle mt={4} width={35} height={35} />
          </div>
          <div className="text">
            <p className="name" style={{ width: "100%", marginTop: "3px" }}>
              <Skeleton mt={4} width="50%" height={25} />
            </p>
            <div className="main" style={{ width: "100%" }}>
              <Skeleton mt={3} width="100%" height={25} />
              <Skeleton mt={3} width="100%" height={25} />
            </div>
          </div>
        </div>
      </CustomSwipeSlide>
    </UserChatWrapper>
  );
};

const EmptyThing = ({ text }: { text: string }) => {
  return (
    <EmptyTitle>
      <Image src="/empty.gif" width={150} height={150} alt="empty" />
      <div>
        You didn{"'"}t {text} anything yet.
      </div>
    </EmptyTitle>
  );
};

const EmptyTitle = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  font-size: 1.1em;

  div {
    margin-top: 30px;
    font-size: 1.4em;
    font-weight: 700;
  }

  @media (max-width: 800px) {
    font-size: 0.9em;
  }
`;

const MyPageConainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const SavedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const SavedContent = styled.div<{ isNew?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: ${({ theme, isNew }) => (isNew ? theme.blue02 : "white")};
  border-left: 1px solid ${({ theme }) => theme.bgColor03};
  border-right: 1px solid ${({ theme }) => theme.bgColor03};
  border-bottom: 1px solid ${({ theme }) => theme.bgColor03};

  // border-radius: 8px;
  // border: 1px solid black;
  // margin-top: 10px;
`;

const LoadMoreButton = styled(Button)`
  width: 95%;
  margin-top: 15px;
  height: 50px;
`;
