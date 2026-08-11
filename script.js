// ==================================================
// 社課簽到系統
// 2堂 / 4堂 / 吃到飽 完整版
// ==================================================


// ==================================================
// 1. Supabase 設定
// ==================================================

const SUPABASE_URL =
    "https://yefgqzjlddszhnaawvjv.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_zjfUBdwwbVfNl1Z52-4vug_dBdwI2Vy";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

console.log("✅ Supabase 連線建立成功");


// ==================================================
// 2. 全域變數
// ==================================================

let todayCourses = [];
let selectedCourse = null;
let currentStudent = null;


// ==================================================
// 3. 載入今天課程
// ==================================================

async function loadCourse() {

    const courseInfo =
        document.getElementById("courseInfo");

    if (!courseInfo) {
        console.error("❌ 找不到 courseInfo");
        return;
    }

    courseInfo.innerHTML =
        "⏳ 課程載入中...";

    try {

        const now = new Date();

        const today =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Taipei",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit"
                }
            ).format(now);

        console.log("📅 今天日期：", today);


        const {
            data,
            error
        } =
            await db
                .from("courses")
                .select("*")
                .eq(
                    "course_date",
                    today
                )
                .order(
                    "checkin_start",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "❌ 課程載入失敗：",
                error
            );

            courseInfo.innerHTML =
                "❌ 課程載入失敗<br><br>" +
                error.message;

            return;
        }


        todayCourses =
            data || [];


        if (
            todayCourses.length === 0
        ) {

            courseInfo.innerHTML =
                `
                <div class="course-title">
                    📚 今天沒有社課
                </div>

                <div style="
                    text-align:center;
                    color:#777;
                    margin-top:10px;
                ">
                    請等待管理員建立今天的課程
                </div>
                `;

            return;
        }


        let html = "";


        html +=
            `
            <div class="course-title">
                📚 今日社課
            </div>
            `;


        todayCourses.forEach(
            function(course, index) {

                const start =
                    new Date(
                        course.checkin_start
                    );


                const end =
                    new Date(
                        course.checkin_end
                    );


                const startText =
                    start.toLocaleTimeString(
                        "zh-TW",
                        {
                            timeZone:
                                "Asia/Taipei",
                            hour:
                                "2-digit",
                            minute:
                                "2-digit"
                        }
                    );


                const endText =
                    end.toLocaleTimeString(
                        "zh-TW",
                        {
                            timeZone:
                                "Asia/Taipei",
                            hour:
                                "2-digit",
                            minute:
                                "2-digit"
                        }
                    );


                html +=
                    `
                    <button
                        type="button"
                        class="course-button"
                        id="courseButton${index}"
                    >

                        <span class="course-name">
                            📚 ${course.course_name}
                        </span>

                        <span class="course-time">
                            ⏰ ${startText} ～ ${endText}
                        </span>

                    </button>
                    `;
            }
        );


        html +=
            `
            <div
                id="selectedCourseText"
                class="selected-course"
            >
                👆 請先選擇要簽到的課程
            </div>
            `;


        courseInfo.innerHTML =
            html;


        todayCourses.forEach(
            function(course, index) {

                const button =
                    document.getElementById(
                        "courseButton" +
                        index
                    );


                if (!button) {
                    return;
                }


                button.onclick =
                    function() {

                        console.log(
                            "🖱️ 點擊課程",
                            index
                        );

                        selectCourse(index);
                    };
            }
        );


    } catch (error) {

        console.error(error);

        courseInfo.innerHTML =
            "❌ 系統連線失敗<br><br>" +
            error.message;
    }
}


// ==================================================
// 4. 選擇課程
// ==================================================

function selectCourse(index) {

    console.log(
        "📚 選擇課程：",
        index
    );


    if (
        !todayCourses[index]
    ) {

        alert(
            "❌ 找不到這堂課"
        );

        return;
    }


    selectedCourse =
        todayCourses[index];


    todayCourses.forEach(
        function(course, i) {

            const button =
                document.getElementById(
                    "courseButton" +
                    i
                );


            if (!button) {
                return;
            }


            if (i === index) {

                button.classList.add(
                    "selected"
                );

            } else {

                button.classList.remove(
                    "selected"
                );
            }
        }
    );


    const selectedText =
        document.getElementById(
            "selectedCourseText"
        );


    if (selectedText) {

        selectedText.innerHTML =
            "✅ 已選擇：<strong>" +
            selectedCourse.course_name +
            "</strong>";
    }


    console.log(
        "✅ 已選擇：",
        selectedCourse.course_name
    );
}


// ==================================================
// 5. 社員登入
// ==================================================

async function login() {

    const nameInput =
        document.getElementById(
            "name"
        );


    const studentIdInput =
        document.getElementById(
            "loginStudentId"
        );


    const departmentInput =
        document.getElementById(
            "department"
        );


    if (!nameInput) {

        alert(
            "❌ 找不到姓名欄位"
        );

        return;
    }


    if (!studentIdInput) {

        alert(
            "❌ 找不到學號欄位"
        );

        return;
    }


    const name =
        nameInput.value.trim();


    const studentId =
        studentIdInput.value.trim();


    const department =
        departmentInput
            ? departmentInput.value.trim()
            : "";


    if (name === "") {

        alert(
            "❌ 請輸入姓名"
        );

        return;
    }


    if (studentId === "") {

        alert(
            "❌ 請輸入學號"
        );

        return;
    }


    if (department === "") {

        alert(
            "❌ 請輸入系級"
        );

        return;
    }


    try {

        console.log(
            "🔍 查詢社員：",
            studentId
        );


        const {
            data: student,
            error
        } =
            await db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (error) {

            console.error(error);

            alert(
                "❌ 查詢社員失敗！\n\n" +
                error.message
            );

            return;
        }


        // ==================================================
        // 找不到 → 建立社員
        // ==================================================

        if (!student) {

            console.log(
                "🆕 建立新社員"
            );


            const {
                data: newStudent,
                error: insertError
            } =
                await db
                    .from("students")
                    .insert([
                        {
                            name:
                                name,

                            "student ID":
                                studentId,

                            department:
                                department,

                            plan:
                                "",

                            lesson:
                                0
                        }
                    ])
                    .select()
                    .single();


            if (insertError) {

                console.error(
                    insertError
                );


                alert(
                    "❌ 建立社員失敗！\n\n" +
                    insertError.message
                );

                return;
            }


            currentStudent =
                newStudent;


            showStudent(
                newStudent
            );


            alert(
                "🎉 歡迎加入社課！\n\n" +
                "姓名：" +
                newStudent.name +
                "\n" +
                "學號：" +
                newStudent["student ID"] +
                "\n" +
                "系級：" +
                newStudent.department +
                "\n" +
                "目前方案：尚未購買"
            );


            return;
        }


        // ==================================================
        // 已經存在
        // ==================================================

        currentStudent =
            student;


        // 更新系級
        if (
            !student.department ||
            student.department !== department
        ) {

            const {
                error:
                    departmentError
            } =
                await db
                    .from("students")
                    .update({
                        department:
                            department
                    })
                    .eq(
                        "student ID",
                        studentId
                    );


            if (
                departmentError
            ) {

                console.error(
                    departmentError
                );


                alert(
                    "❌ 更新社員資料失敗！\n\n" +
                    departmentError.message
                );

                return;
            }


            student.department =
                department;
        }


        // 更新姓名
        if (
            student.name !== name
        ) {

            const {
                error:
                    nameError
            } =
                await db
                    .from("students")
                    .update({
                        name:
                            name
                    })
                    .eq(
                        "student ID",
                        studentId
                    );


            if (nameError) {

                console.error(
                    nameError
                );


                alert(
                    "❌ 更新姓名失敗！\n\n" +
                    nameError.message
                );

                return;
            }


            student.name =
                name;
        }


        showStudent(
            student
        );


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 6. 顯示社員
// ==================================================

function showStudent(student) {

    const studentInfo =
        document.getElementById(
            "studentInfo"
        );


    const welcomeText =
        document.getElementById(
            "welcomeText"
        );


    const lessonText =
        document.getElementById(
            "lessonText"
        );


    // ★ 修正 HTML 真正的 ID
    const studentDepartment =
        document.getElementById(
            "studentDepartmentText"
        );


    if (
        !studentInfo ||
        !welcomeText ||
        !lessonText
    ) {

        console.error(
            "❌ 找不到社員資料區"
        );

        return;
    }


    studentInfo.style.display =
        "block";


    welcomeText.innerText =
        "👋 歡迎 " +
        student.name;


    // ==================================================
    // 吃到飽
    // ==================================================

    if (
        student.plan === "吃到飽"
    ) {

        lessonText.innerText =
            "目前方案：吃到飽 ♾️";


    } else {

        const lessons =
            Number(
                student.lesson
            ) || 0;


        if (
            student.plan === "2堂"
        ) {

            lessonText.innerText =
                "方案：2堂｜剩餘：" +
                lessons +
                " 堂";

        } else if (
            student.plan === "4堂"
        ) {

            lessonText.innerText =
                "方案：4堂｜剩餘：" +
                lessons +
                " 堂";

        } else {

            lessonText.innerText =
                "目前方案：尚未購買";
        }
    }


    if (studentDepartment) {

        studentDepartment.innerText =
            "系級：" +
            (
                student.department ||
                "尚未設定"
            );
    }
}


// ==================================================
// 7. 社員簽到
// ==================================================

async function checkIn() {

    if (!currentStudent) {

        alert(
            "❌ 請先登入社員資料"
        );

        return;
    }


    if (!selectedCourse) {

        alert(
            "📚 請先選擇今天要上的課程"
        );

        return;
    }


    const studentId =
        currentStudent[
            "student ID"
        ];


    try {

        const course =
            selectedCourse;


        // ==================================================
        // 檢查時間
        // ==================================================

        const now =
            new Date();


        const startTime =
            new Date(
                course.checkin_start
            );


        const endTime =
            new Date(
                course.checkin_end
            );


        if (
            now < startTime
        ) {

            alert(
                "⏰ 尚未開始簽到！\n\n" +
                "課程：" +
                course.course_name
            );

            return;
        }


        if (
            now > endTime
        ) {

            alert(
                "⛔ 簽到時間已截止！\n\n" +
                "課程：" +
                course.course_name
            );

            return;
        }


        // ==================================================
        // 查詢最新社員資料
        // ==================================================

        const {
            data: student,
            error:
                studentError
        } =
            await db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (studentError) {

            alert(
                "❌ 查詢社員失敗！\n\n" +
                studentError.message
            );

            return;
        }


        if (!student) {

            alert(
                "❌ 找不到社員資料"
            );

            return;
        }


        // ==================================================
        // 檢查是否已簽到
        // ==================================================

        const {
            data:
                existingAttendance,
            error:
                attendanceError
        } =
            await db
                .from("attendance")
                .select("id")
                .eq(
                    "student ID",
                    studentId
                )
                .eq(
                    "course_date",
                    course.course_date
                )
                .eq(
                    "course_name",
                    course.course_name
                )
                .maybeSingle();


        if (
            attendanceError
        ) {

            alert(
                "❌ 檢查簽到紀錄失敗！\n\n" +
                attendanceError.message
            );

            return;
        }


        if (
            existingAttendance
        ) {

            alert(
                "⚠️ 你已經簽到過這堂課了！"
            );

            return;
        }


        // ==================================================
        // 判斷方案
        // ==================================================

        const isUnlimited =
            student.plan === "吃到飽";


        // ==================================================
        // 吃到飽
        // ==================================================

        if (isUnlimited) {

            const {
                error:
                    insertError
            } =
                await db
                    .from("attendance")
                    .insert([
                        {
                            "student ID":
                                studentId,

                            course_name:
                                course.course_name,

                            course_date:
                                course.course_date
                        }
                    ]);


            if (insertError) {

                console.error(
                    insertError
                );


                alert(
                    "❌ 建立簽到紀錄失敗！\n\n" +
                    insertError.message
                );

                return;
            }


            currentStudent =
                student;


            alert(
                "🎉 簽到成功！\n\n" +
                "姓名：" +
                student.name +
                "\n" +
                "學號：" +
                student["student ID"] +
                "\n" +
                "系級：" +
                (
                    student.department ||
                    ""
                ) +
                "\n" +
                "方案：吃到飽 ♾️\n" +
                "課程：" +
                course.course_name +
                "\n" +
                "使用：不限堂數\n" +
                "剩餘：無限"
            );


            selectedCourse =
                null;


            document
                .querySelectorAll(
                    ".course-button"
                )
                .forEach(
                    function(button) {

                        button.classList.remove(
                            "selected"
                        );
                    }
                );


            const selectedText =
                document.getElementById(
                    "selectedCourseText"
                );


            if (selectedText) {

                selectedText.innerHTML =
                    "👆 請選擇下一堂課";
            }


            return;
        }


        // ==================================================
        // 2堂 / 4堂方案
        // ==================================================

        const lessons =
            Number(
                student.lesson
            ) || 0;


        if (
            lessons <= 0
        ) {

            alert(
                "❌ 目前沒有剩餘堂數！\n\n" +
                "請洽管理員購買方案。"
            );

            return;
        }


        // ==================================================
        // 扣一堂
        // ==================================================

        const newLesson =
            lessons - 1;


        const {
            error:
                updateError
        } =
            await db
                .from("students")
                .update({
                    lesson:
                        newLesson
                })
                .eq(
                    "student ID",
                    studentId
                );


        if (updateError) {

            console.error(
                updateError
            );


            alert(
                "❌ 扣堂失敗！\n\n" +
                updateError.message
            );

            return;
        }


        // ==================================================
        // 建立簽到紀錄
        // ==================================================

        const {
            error:
                insertError
        } =
            await db
                .from("attendance")
                .insert([
                    {
                        "student ID":
                            studentId,

                        course_name:
                            course.course_name,

                        course_date:
                            course.course_date
                    }
                ]);


        if (insertError) {

            console.error(
                insertError
            );


            // 加回堂數
            await db
                .from("students")
                .update({
                    lesson:
                        lessons
                })
                .eq(
                    "student ID",
                    studentId
                );


            alert(
                "❌ 建立簽到紀錄失敗！\n\n" +
                insertError.message
            );

            return;
        }


        // ==================================================
        // 更新畫面
        // ==================================================

        const lessonText =
            document.getElementById(
                "lessonText"
            );


        if (lessonText) {

            lessonText.innerText =
                "方案：" +
                (
                    student.plan ||
                    "一般方案"
                ) +
                "｜剩餘：" +
                newLesson +
                " 堂";
        }


        currentStudent.lesson =
            newLesson;


        alert(
            "🎉 簽到成功！\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "系級：" +
            (
                student.department ||
                ""
            ) +
            "\n" +
            "方案：" +
            (
                student.plan ||
                ""
            ) +
            "\n" +
            "課程：" +
            course.course_name +
            "\n" +
            "使用：1 堂\n" +
            "剩餘：" +
            newLesson +
            " 堂"
        );


        selectedCourse =
            null;


        document
            .querySelectorAll(
                ".course-button"
            )
            .forEach(
                function(button) {

                    button.classList.remove(
                        "selected"
                    );
                }
            );


        const selectedText =
            document.getElementById(
                "selectedCourseText"
            );


        if (selectedText) {

            selectedText.innerHTML =
                "👆 請選擇下一堂課";
        }


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 8. 管理員登入
// ==================================================

function adminLogin() {

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );


    if (!passwordInput) {

        alert(
            "❌ 找不到管理員密碼欄位"
        );

        return;
    }


    const password =
        passwordInput.value;


    const ADMIN_PASSWORD =
        "06020602";


    if (
        password ===
        ADMIN_PASSWORD
    ) {

        const adminArea =
            document.getElementById(
                "adminArea"
            );


        if (adminArea) {

            adminArea.style.display =
                "block";
        }


        alert(
            "🔓 管理員登入成功！"
        );


        passwordInput.value =
            "";


    } else {

        alert(
            "❌ 管理員密碼錯誤！"
        );
    }
}


// ==================================================
// 9. 管理員：查詢社員
// ==================================================

async function showStudentAdmin() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到社員學號欄位"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (!studentId) {

        alert(
            "❌ 請輸入社員學號"
        );

        return;
    }


    try {

        const {
            data: student,
            error
        } =
            await db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (error) {

            alert(
                "❌ 查詢失敗！\n\n" +
                error.message
            );

            return;
        }


        if (!student) {

            alert(
                "❌ 找不到這個社員！"
            );

            return;
        }


        let planText =
            student.plan ||
            "尚未設定";


        let lessonText;


        if (
            student.plan === "吃到飽"
        ) {

            lessonText =
                "無限";

        } else {

            lessonText =
                (
                    Number(
                        student.lesson
                    ) || 0
                ) +
                " 堂";
        }


        alert(
            "👤 社員資料\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "系級：" +
            (
                student.department ||
                "尚未設定"
            ) +
            "\n" +
            "方案：" +
            planText +
            "\n" +
            "剩餘堂數：" +
            lessonText
        );


    } catch (error) {

        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 10. 管理員：增加 2 堂
// ==================================================

async function addTwoLessons() {

    await addLessons(
        2,
        "2堂"
    );
}


// ==================================================
// 11. 管理員：增加 4 堂
// ==================================================

async function addFourLessons() {

    await addLessons(
        4,
        "4堂"
    );
}


// ==================================================
// 12. 管理員：吃到飽
// ==================================================

async function addUnlimitedPlan() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到社員學號欄位"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (!studentId) {

        alert(
            "❌ 請先輸入社員學號"
        );

        return;
    }


    try {

        const {
            data: student,
            error
        } =
            await db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (error) {

            console.error(error);


            alert(
                "❌ 查詢社員失敗！\n\n" +
                error.message
            );

            return;
        }


        if (!student) {

            alert(
                "❌ 找不到這個社員！\n\n" +
                "學號：" +
                studentId
            );

            return;
        }


        const {
            error:
                updateError
        } =
            await db
                .from("students")
                .update({
                    plan:
                        "吃到飽",

                    lesson:
                        0
                })
                .eq(
                    "student ID",
                    studentId
                );


        if (updateError) {

            console.error(
                updateError
            );


            alert(
                "❌ 設定吃到飽失敗！\n\n" +
                updateError.message
            );

            return;
        }


        alert(
            "♾️ 吃到飽方案設定成功！\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "方案：吃到飽\n" +
            "剩餘：無限"
        );


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 13. 管理員：增加堂數
// ==================================================

async function addLessons(
    amount,
    planName
) {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到社員學號欄位"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (!studentId) {

        alert(
            "❌ 請先輸入社員學號"
        );

        return;
    }


    try {

        // ==================================================
        // 查詢社員
        // ==================================================

        const {
            data: student,
            error
        } =
            await db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (error) {

            console.error(error);


            alert(
                "❌ 查詢社員失敗！\n\n" +
                error.message
            );

            return;
        }


        if (!student) {

            alert(
                "❌ 找不到這個社員！\n\n" +
                "學號：" +
                studentId +
                "\n\n" +
                "請先讓社員登入一次建立資料。"
            );

            return;
        }


        const oldLesson =
            Number(
                student.lesson
            ) || 0;


        const newLesson =
            oldLesson + amount;


        // ==================================================
        // 更新方案與堂數
        // ==================================================

        const {
            error:
                updateError
        } =
            await db
                .from("students")
                .update({
                    plan:
                        planName,

                    lesson:
                        newLesson
                })
                .eq(
                    "student ID",
                    studentId
                );


        if (updateError) {

            console.error(
                updateError
            );


            alert(
                "❌ 更新社員資料失敗！\n\n" +
                updateError.message
            );

            return;
        }


        alert(
            "✅ " +
            planName +
            "方案設定成功！\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "方案：" +
            planName +
            "\n" +
            "目前剩餘：" +
            newLesson +
            " 堂"
        );


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 14. 管理員：建立課程
// ==================================================

async function createCourse() {

    const courseNameInput =
        document.getElementById(
            "courseName"
        );


    const courseDateInput =
        document.getElementById(
            "courseDate"
        );


    const startInput =
        document.getElementById(
            "checkinStart"
        );


    const endInput =
        document.getElementById(
            "checkinEnd"
        );


    if (
        !courseNameInput ||
        !courseDateInput ||
        !startInput ||
        !endInput
    ) {

        alert(
            "❌ 找不到課程欄位"
        );

        return;
    }


    const courseName =
        courseNameInput.value.trim();


    const courseDate =
        courseDateInput.value;


    const checkinStart =
        startInput.value;


    const checkinEnd =
        endInput.value;


    if (
        !courseName ||
        !courseDate ||
        !checkinStart ||
        !checkinEnd
    ) {

        alert(
            "❌ 請把課程資料填寫完整！"
        );

        return;
    }


    try {

        const startDateTime =
            courseDate +
            "T" +
            checkinStart +
            ":00+08:00";


        const endDateTime =
            courseDate +
            "T" +
            checkinEnd +
            ":00+08:00";


        if (
            new Date(
                endDateTime
            ) <=
            new Date(
                startDateTime
            )
        ) {

            alert(
                "❌ 簽到截止時間必須晚於開始時間！"
            );

            return;
        }


        const {
            data,
            error
        } =
            await db
                .from("courses")
                .insert([
                    {
                        course_name:
                            courseName,

                        course_date:
                            courseDate,

                        checkin_start:
                            startDateTime,

                        checkin_end:
                            endDateTime
                    }
                ])
                .select()
                .single();


        if (error) {

            console.error(
                error
            );


            alert(
                "❌ 建立課程失敗！\n\n" +
                error.message
            );

            return;
        }


        alert(
            "🎉 課程建立成功！\n\n" +
            "課程：" +
            data.course_name +
            "\n" +
            "日期：" +
            data.course_date +
            "\n" +
            "簽到時間：" +
            checkinStart +
            " ～ " +
            checkinEnd
        );


        courseNameInput.value =
            "";

        courseDateInput.value =
            "";

        startInput.value =
            "";

        endInput.value =
            "";


        await loadCourse();


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 15. 管理員：查看簽到紀錄
// ==================================================

async function loadAttendance() {

    const list =
        document.getElementById(
            "attendanceList"
        );


    if (!list) {

        alert(
            "❌ 找不到簽到紀錄區"
        );

        return;
    }


    list.innerHTML =
        "⏳ 載入中...";


    try {

        const {
            data,
            error
        } =
            await db
                .from("attendance")
                .select("*")
                .order(
                    "checkin_time",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {

            list.innerHTML =
                "❌ 載入失敗<br>" +
                error.message;

            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            list.innerHTML =
                `
                <div style="
                    text-align:center;
                    margin-top:20px;
                ">
                    目前還沒有簽到紀錄
                </div>
                `;

            return;
        }


        let html =
            `
            <p style="
                text-align:center;
            ">
                目前共有
                <strong>
                    ${data.length}
                </strong>
                筆簽到紀錄
            </p>
            `;


        data.forEach(
            function(record) {

                let time =
                    "未知";


                if (
                    record.checkin_time
                ) {

                    time =
                        new Date(
                            record.checkin_time
                        ).toLocaleString(
                            "zh-TW",
                            {
                                timeZone:
                                    "Asia/Taipei"
                            }
                        );
                }


                html +=
                    `
                    <div class="attendance-card">

                        <strong>
                            📚 ${
                                record.course_name ||
                                "未知課程"
                            }
                        </strong>

                        <br>

                        學號：
                        ${
                            record["student ID"] ||
                            ""
                        }

                        <br>

                        日期：
                        ${
                            record.course_date ||
                            ""
                        }

                        <br>

                        簽到時間：
                        ${time}

                    </div>
                    `;
            }
        );


        list.innerHTML =
            html;


    } catch (error) {

        console.error(
            error
        );


        list.innerHTML =
            "❌ 發生錯誤<br>" +
            error.message;
    }
}


// ==================================================
// 16. 網頁載入
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "✅ 網頁載入完成"
        );

        loadCourse();
    }
);
