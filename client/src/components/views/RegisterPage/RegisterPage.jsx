import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../../_actions/user_action";
import { useNavigate } from "react-router-dom";
import Auth from "../../../hoc/auth";
import styles from "./RegisterPage.module.css";
import Header from "../../header/Header";
import { v1 as uuid } from "uuid";

function RegisterPage(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [Username, setUsername] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [Name, setName] = useState("");
    const [Email, setEmail] = useState("");

    const onUsernameHandler = (event) => {
        setUsername(event.currentTarget.value);
    };
    const onPasswordHandler = (event) => {
        setPassword(event.currentTarget.value);
    };
    const onConfirmPasswordHandler = (event) => {
        setConfirmPassword(event.currentTarget.value);
    };
    const onNameHandler = (event) => {
        setName(event.currentTarget.value);
    };
    const onEmailHandler = (event) => {
        setEmail(event.currentTarget.value);
    };

    // 프로필 이미지 업로드 구현 영역
    const [ImageUrl, setImageUrl] = useState(null);
    const imgRef = useRef();

    // [프로필 이미지를 업로드해주세요] 버튼 클릭 시 실행
    const onClickFileBtn = (e) => {
        imgRef.current.click();
    };
    const onChangeImage = async () => {
        const originalFile = imgRef.current.files[0];
        const fileReader = new FileReader();
        const imgObject = new Image();
        const canvas = document.querySelector("#myCanvas");
        const originalImg = document.querySelector(".img__original");
        fileReader.readAsDataURL(originalFile);
        fileReader.onload = async (event) => {
            imgObject.src = event.target.result;
            imgObject.onload = async () => {
                originalImg.src = imgObject.src;
                await Nooki(canvas, originalImg);
                const removedBgImg = canvas.toDataURL("image/png");
                const target = "/s3Url/" + uuid();
                const S3url = await fetch(target).then((res) => res.json());
                let bstr = atob(removedBgImg?.split(",")[1]);
                let n = bstr.length;
                let u8arr = new Uint8Array(n);

                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }

                let file = new File([u8arr], "imgFile.png", { type: "mime" });
                await fetch(S3url.url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    body: file,
                });
                const imageUrl = S3url.url?.split("?")[0];
                setImageUrl(imageUrl);

                async function Nooki(canvas, originalImg) {
                    let ctx = canvas.getContext("2d");
                    console.log("hihihi", canvas, originalImg);
                    canvas.width = originalImg.width;
                    canvas.height = originalImg.height;
                    console.log(
                        "hihihi",
                        canvas,
                        originalImg.width,
                        originalImg.height,
                        originalImg.naturalWidth,
                        originalImg.naturalHeight
                    );
                    await ctx.drawImage(
                        originalImg,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    try {
                        const _id = await ctx.getImageData(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );
                        const pixels = _id.data;

                        let arr = [];
                        let idx = 0;
                        for (let i = 0; i < canvas.height; i++) {
                            let arrayOfImgInRow = [];
                            for (let j = 0; j < canvas.width; j++) {
                                let arrayOfRgb = [];
                                for (let k = 0; k < 4; k++) {
                                    arrayOfRgb.push(_id.data[idx++]);
                                }
                                arrayOfImgInRow.push(arrayOfRgb);
                            }
                            arr.push(arrayOfImgInRow);
                        }

                        let visited = [];
                        for (let i = 0; i < arr.length; i++) {
                            let tmp = [];
                            for (let j = 0; j < arr[0].length; j++) {
                                tmp.push(false);
                            }
                            visited.push(tmp);
                        }
                        await stack_DFS(0, 0);
                        await stack_DFS(0, canvas.width - 1);
                        await stack_DFS(canvas.height - 1, canvas.width - 1);
                        await stack_DFS(canvas.height - 1, 0);

                        async function stack_DFS(x, y) {
                            let queue = [];
                            queue.push([x, y]);

                            while (queue.length > 0) {
                                let [current_x, current_y] = queue.pop();
                                visited[current_x][current_y] = true;
                                let dir_array = [
                                    [-1, 0],
                                    [1, 0],
                                    [0, -1],
                                    [0, 1],
                                ];
                                for (let i = 0; i < 4; i++) {
                                    let new_x = current_x + dir_array[i][0];
                                    let new_y = current_y + dir_array[i][1];
                                    if (
                                        0 <= new_x &&
                                        new_x < arr.length &&
                                        0 <= new_y &&
                                        new_y < arr[0].length
                                    ) {
                                        if (
                                            visited[new_x][new_y] === false &&
                                            arr[new_x][new_y][0] >=
                                                arr[current_x][current_y][0] -
                                                    1 &&
                                            arr[new_x][new_y][0] <=
                                                arr[current_x][current_y][0] +
                                                    1 &&
                                            arr[new_x][new_y][1] >=
                                                arr[current_x][current_y][1] -
                                                    1 &&
                                            arr[new_x][new_y][1] <=
                                                arr[current_x][current_y][1] +
                                                    1 &&
                                            arr[new_x][new_y][2] >=
                                                arr[current_x][current_y][2] -
                                                    1 &&
                                            arr[new_x][new_y][2] <=
                                                arr[current_x][current_y][2] + 1
                                        ) {
                                            queue.push([new_x, new_y]);
                                        }
                                    }
                                }
                            }
                        }

                        let idx_ = 0;
                        for (let i = 0; i < canvas.height; i++) {
                            for (let j = 0; j < canvas.width; j++) {
                                if (visited[i][j]) {
                                    pixels[idx_] = 0;
                                    pixels[idx_ + 1] = 0;
                                    pixels[idx_ + 2] = 0;
                                    pixels[idx_ + 3] = 0;
                                }
                                idx_ = idx_ + 4;
                            }
                        }
                        await ctx.putImageData(_id, 0, 0);
                        return ctx;
                    } catch {
                        alert("이미지 업로드에 실패했습니다.");
                    }
                }
            };
        };

        // reader.onloadend = () => {
        //     setImageUrl(imageUrl);
        // };
    };
    // 프로필 이미지 업로드 구현 영역

    const onSubmitHandler = (event) => {
        event.preventDefault();

        if (Password !== ConfirmPassword) {
            return alert("패스워드와 패스워드 확인이 일치하지 않습니다.");
        }

        let body = {
            username: Username,
            password: Password,
            name: Name,
            email: Email,
            profileImage: ImageUrl,
        };

        dispatch(registerUser(body)).then((response) => {
            console.log(response.payload);
            if (response.payload.success) {
                navigate("/");
            } else {
                alert("회원가입에 실패하였습니다.");
            }
        });
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <div style={{ display: "none" }}>
                    <img className="img__original" alt="img" />
                    <h1>RemoveBackground Page</h1>
                    <canvas id="myCanvas"></canvas>
                </div>
                <div className={styles.loginBox}>
                    <div className={styles.loginContents}>
                        <div className={styles.loginText}>
                            <span>회원가입</span>
                        </div>
                        <form
                            className={styles.loginForm}
                            encType="multipart/form-data"
                            onSubmit={onSubmitHandler}
                        >
                            {/* 프로필 이미지 업로드 : 시작 */}
                            <input
                                style={{ display: "none" }}
                                type="file"
                                ref={imgRef}
                                onChange={onChangeImage}
                            />
                            <div
                                className={styles.inputs}
                                onClick={() => {
                                    onClickFileBtn();
                                }}
                            >
                                <img
                                    className={styles.uploadImage}
                                    src={ImageUrl ? ImageUrl : ""}
                                />
                                프로필 이미지를 업로드해주세요.
                            </div>
                            {/* 프로필 이미지 업로드 : 끝 */}

                            <input
                                autoFocus
                                className={styles.inputs}
                                type="text"
                                value={Username}
                                onChange={onUsernameHandler}
                                placeholder="아이디"
                            />
                            <input
                                className={styles.inputs}
                                type="password"
                                value={Password}
                                onChange={onPasswordHandler}
                                placeholder="비밀번호(5글자 이상)"
                            />
                            <input
                                className={styles.inputs}
                                type="password"
                                value={ConfirmPassword}
                                onChange={onConfirmPasswordHandler}
                                placeholder="비밀번호 확인"
                            />
                            <input
                                className={styles.inputs}
                                type="text"
                                value={Name}
                                onChange={onNameHandler}
                                placeholder="이름"
                            />
                            <input
                                className={styles.inputs}
                                type="email"
                                value={Email}
                                onChange={onEmailHandler}
                                placeholder="이메일 주소"
                            />
                            <button className={styles.buttons} type="submit">
                                회원가입
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Auth(RegisterPage, "register");
