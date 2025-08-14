import { Avatar } from "@/components/avatar-module/Avatar";
import BGLight from "@/game/BGLight";
import { PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function WhatFeatrue() {
    return (
        <>
            <div className="w-full h-full lg:flex overflow-y-scroll lg:overflow-visible">
                <div className="h-[400px] lg:h-full lg:shrink-0 lg:w-1/3">
                    <Canvas>
                        <group rotation={[0, 0.05, 0]}>
                            <Avatar
                                lookAtCamera={false}
                                motionURL={`/game-asset/motion-files/rpm-avatar-motion/masculine/fbx/expression/M_Standing_Expressions_005.fbx`}
                                avatarURL={`/game-asset/rpm/fixed/office-guy.glb?WhatFeature`}
                            ></Avatar>
                        </group>

                        <PerspectiveCamera
                            makeDefault
                            position={[0, 1.5, 2.5]}
                            rotation={[-0.175, 0, 0]}
                        ></PerspectiveCamera>
                        <BGLight></BGLight>
                    </Canvas>
                </div>
                {/*  */}
                {/*  */}
                <div className="lg:shrink-0 lg:w-2/3">
                    <div className="w-full h-full flex flex-col items-center p-[30px] lg:overflow-y-auto">
                        <div className="text-3xl mb-3 ">{`🌟 Vibe Coding 介紹 🌟  `}</div>
                        <div className="text-gray-700 max-w-[500px] mb-12 ">
                            {`你可以直接描述你的應用 ✨，然後人工智能會幫你寫軟件！🤖`.trim()}
                        </div>

                        <div className="text-3xl mb-3 ">{`🌈 Vibe Coding 嘅實際應用 🌈  `}</div>
                        <div className="text-gray-700 max-w-[600px] mb-12 whitespace-pre-wrap">
                            {`Vibe coding 唔單止係好玩嘅創意表達，仲有好多實際應用可以融入日常生活同工作！💡 以下係幾個 vibe coding 嘅實用場景：  

1. 互動藝術創作 🎨  
用程式碼設計動態視覺效果或生成藝術，比如喺網頁上整一個隨音樂節奏變色嘅背景，或者用 Processing 創造獨特嘅數碼畫作，完美展示你嘅個人風格！✨  


2. 個人化數碼體驗 📱  
為你嘅網站、社交媒體或個人項目加入「vibe」，例如整一個互動式 portfolio，透過動畫同聲音同 user 互動，畀人留下深刻印象！😎  


3. 遊戲化學習同工作 🎮  
用 vibe coding 開發小遊戲或工具，幫你或同事更輕鬆咁學習新技能或完成任務，比如一個有 vibe 嘅學習 app，透過視覺同音效激勵進度！🚀  


4. 情感化數據可視化 📊  
將枯燥嘅數據變成充滿情感嘅圖表或動畫，例如用 D3.js 整一個隨心情變化嘅數據展示，畀觀眾更有共鳴！💖  


5. 社交媒體內容創作 📸  
用 code 整濾鏡、動畫或 AR 效果，幫你喺 Instagram 或 TikTok 製作吸睛內容，突顯你嘅獨特 vibe！🔥  


Vibe coding 將技術同創意結合，無論係個人 project 定係商業用途，都能幫你打造與眾不同嘅體驗！💻🌟 想試？即刻開始你嘅 vibe coding 之旅啦！😍  `.trim()}
                        </div>

                        {/*  */}
                        {/*  */}
                    </div>
                </div>
            </div>
        </>
    );
}

//

//

//

//
