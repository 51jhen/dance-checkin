// ==================================================
// 社課簽到系統
// 完整版
// ==================================================


// ==================================================
// 全域變數
// ==================================================

let todayCourses = [];

let selectedCourse = null;

let currentStudent = null;


// ==================================================
// 等待網頁載入
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "✅ HTML 載入完成"
        );


        if (!window.db) {

            console.error(
                "❌ 找不到 Supabase db"
            );

            alert(
                "❌ 系統連線失敗！\n\n" +
                "請檢查 supabase.js"
            );

            return;
        }


        console.log(
            "✅ db 已存在"
        );


        loadCourse();

    }
);


// ==================================================
// 取得今天日期
// ==================================================

function getTaiwanDate() {

    const now =
        new Date();


    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    "Asia/Taipei",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit"
            }
        ).formatToParts(now);


    let year = "";

    let month = "";

    let day = "";


    parts.forEach(
        function (part) {

            if (
                part.type ===
                "year"
            ) {

                year =
                    part.value;
            }


            if (
                part.type ===
                "month"
            ) {

                month =
                    part.value;
            }


            if (
                part.type ===
                "day"
            ) {

                day =
                    part.value;
            }

        }
    );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


// ==================================================
// 1. 載入今天課程
// ==================================================

async function loadCourse() {

    console.log(
        "📚 開始載入今天課程"
    );


    const courseInfo =
        document.getElementById(
            "courseInfo"
        );


    if (!courseInfo) {

        console.error(
            "❌ 找不到 courseInfo"
        );

        return;
    }


    courseInfo.innerHTML =
        "⏳ 課程載入中...";


    try {

        const today =
            getTaiwanDate();


        console.log(
            "📅 今天日期：",
            today
        );


        const result =
            await window.db
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


        const courses =
            result.data;


        const error =
            result.error;


        if (error) {

            console.error(
                "❌ 課程查詢失敗：",
                error
            );


            courseInfo.innerHTML =
                "❌ 課程載入失敗<br><br>" +
                error.message;


            return;
        }


        todayCourses =
            courses || [];


        console.log(
            "✅ 今天課程：",
            todayCourses
        );


        // 沒有課

        if (
            todayCourses.length ===
            0
        ) {

            courseInfo.innerHTML =
                `
                <div
                    class="course-title"
                >
                    📚 今日社課
                </div>

                <div
                    style="
                        text-align:center;
                        color:#777;
                        padding:15px;
                    "
                >
                    今天沒有社課
                </div>
                `;


            return;
        }


        // ==================================================
        // 顯示課程
        // ==================================================

        let html = "";


        html +=
            `
            <div
                class="course-title"
            >
                📚 今日社課
            </div>
            `;


        todayCourses.forEach(
            function (
                course,
                index
            ) {

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


                /*
                 * 注意：
                 * 這裡直接使用 onclick。
                 * 不再使用 touchend。
                 */

                html +=
                    `
                    <button
                        type="button"
                        id="courseButton${index}"
                        class="course-button"
                        onclick="selectCourse(${index})"
                    >

                        <span
                            class="course-name"
                        >
                            📚 ${escapeHtml(
                                course.course_name
                            )}
                        </span>

                        <span
                            class="course-time"
                        >
                            ⏰ ${startText}
                            ～ ${endText}
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


        console.log(
            "✅ 課程按鈕已建立"
        );

    } catch (error) {

        console.error(
            "❌ loadCourse 發生錯誤：",
            error
        );


        courseInfo.innerHTML =
            "❌ 課程載入失敗<br><br>" +
            error.message;
    }
}


// ==================================================
// HTML 安全處理
// ==================================================

function escapeHtml(text) {

    if (
        text === null ||
        text === undefined
    ) {

        return "";
    }


    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==================================================
// 2. 選擇課程
// ==================================================

function selectCourse(index) {

    console.log(
        "🟢 selectCourse 被呼叫：",
        index
    );


    if (
        !todayCourses ||
        !todayCourses[index]
    ) {

        alert(
            "❌ 找不到這堂課！"
        );

        return;
    }


    selectedCourse =
        todayCourses[index];


    console.log(
        "✅ 已選擇課程：",
        selectedCourse
    );


    // ==================================================
    // 更新按鈕
    // ==================================================

    todayCourses.forEach(
        function (
            course,
            i
        ) {

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


    // ==================================================
    // 顯示選擇
    // ==================================================

    const selectedText =
        document.getElementById(
            "selectedCourseText"
        );


    if (selectedText) {

        selectedText.innerHTML =
            "✅ 已選擇：" +
            "<strong>" +
            escapeHtml(
                selectedCourse.course_name
            ) +
            "</strong>";
    }


    // ==================================================
    // 如果已經登入
    // ==================================================

    updateLessonText();


    /*
     * 這裡先不要 alert。
     * 手機點擊後看到按鈕變灰
     * 就代表成功了。
     */

}


// ==================================================
// 更新社員畫面
// ==================================================

function updateLessonText() {

    const lessonText =
        document.getElementById(
            "lessonText"
        );


    if (
        !lessonText ||
        !currentStudent
    ) {

        return;
    }


    const lessons =
        Number(
            currentStudent.lesson
        ) || 0;


    let text =
        "目前剩餘堂數：" +
        lessons +
        " 堂";


    if (selectedCourse) {

        text +=
            "<br><br>" +
            "📚 已選課程：" +
            escapeHtml(
                selectedCourse.course_name
            );
    }


    lessonText.innerHTML =
        text;
}


// ==================================================
// 3. 社員登入
// ==================================================

async function login() {

    console.log(
        "🟢 login()"
    );


    const nameInput =
        document.getElementById(
            "name"
        );


    const studentIdInput =
        document.getElementById(
            "loginStudentId"
        );


    if (!nameInput) {

        alert(
            "❌ 找不到姓名輸入框"
        );

        return;
    }


    if (!studentIdInput) {

        alert(
            "❌ 找不到學號輸入框"
        );

        return;
    }


    const name =
        nameInput.value.trim();


    const studentId =
        studentIdInput.value.trim();


    if (name === "") {

        alert(
            "❌ 請輸入姓名！"
        );

        return;
    }


    if (studentId === "") {

        alert(
            "❌ 請輸入學號！"
        );

        return;
    }


    try {

        const result =
            await window.db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        const student =
            result.data;


        const error =
            result.error;


        if (error) {

            console.error(
                error
            );


            alert(
                "❌ 查詢社員失敗！\n\n" +
                error.message
            );


            return;
        }


        // ==================================================
        // 新社員
        // ==================================================

        if (!student) {

            const insertResult =
                await window.db
                    .from("students")
                    .insert([
                        {
                            name:
                                name,

                            "student ID":
                                studentId,

                            department:
                                "",

                            plan:
                                "",

                            lesson:
                                0
                        }
                    ])
                    .select()
                    .single();


            if (
                insertResult.error
            ) {

                console.error(
                    insertResult.error
                );


                alert(
                    "❌ 建立社員失敗！\n\n" +
                    insertResult
                        .error
                        .message
                );


                return;
            }


            currentStudent =
                insertResult.data;


            showStudent(
                currentStudent
            );


            alert(
                "🎉 歡迎加入社課！\n\n" +
                "姓名：" +
                currentStudent.name +
                "\n" +
                "學號：" +
                currentStudent[
                    "student ID"
                ] +
                "\n" +
                "目前堂數：0 堂"
            );


            return;
        }


        // ==================================================
        // 舊社員
        // ==================================================

        currentStudent =
            student;


        showStudent(
            currentStudent
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 4. 顯示社員
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


    currentStudent =
        student;


    studentInfo.style.display =
        "block";


    welcomeText.innerText =
        "👋 歡迎 " +
        student.name;


    updateLessonText();


    if (
        todayCourses.length >
            0 &&
        !selectedCourse
    ) {

        console.log(
            "👆 請選擇課程"
        );

    }
}


// ==================================================
// 5. 簽到
// ==================================================

async function checkIn() {

    console.log(
        "🟢 checkIn()"
    );


    const studentIdInput =
        document.getElementById(
            "loginStudentId"
        );


    if (!studentIdInput) {

        alert(
            "❌ 找不到學號"
        );

        return;
    }


    const studentId =
        studentIdInput.value.trim();


    if (studentId === "") {

        alert(
            "❌ 請先輸入學號！"
        );

        return;
    }


    if (!selectedCourse) {

        alert(
            "📚 請先選擇今天要上的課程！"
        );

        return;
    }


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
                course.course_name +
                "\n" +
                "開始：" +
                startTime.toLocaleString(
                    "zh-TW",
                    {
                        timeZone:
                            "Asia/Taipei"
                    }
                )
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
        // 查詢社員
        // ==================================================

        const studentResult =
            await window.db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (
            studentResult.error
        ) {

            alert(
                "❌ 查詢社員失敗！\n\n" +
                studentResult
                    .error
                    .message
            );


            return;
        }


        const student =
            studentResult.data;


        if (!student) {

            alert(
                "❌ 找不到社員資料！\n\n" +
                "請先按「繼續」。"
            );


            return;
        }


        // ==================================================
        // 檢查堂數
        // ==================================================

        const lessons =
            Number(
                student.lesson
            ) || 0;


        if (
            lessons <= 0
        ) {

            alert(
                "❌ 目前沒有剩餘堂數！"
            );


            return;
        }


        // ==================================================
        // 檢查是否已簽到
        // ==================================================

        const attendanceResult =
            await window.db
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
                .limit(1);


        if (
            attendanceResult.error
        ) {

            alert(
                "❌ 查詢簽到紀錄失敗！\n\n" +
                attendanceResult
                    .error
                    .message
            );


            return;
        }


        const existing =
            attendanceResult.data;


        if (
            existing &&
            existing.length > 0
        ) {

            alert(
                "⚠️ 你已經簽到過這堂課了！\n\n" +
                "課程：" +
                course.course_name
            );


            return;
        }


        // ==================================================
        // 扣一堂
        // ==================================================

        const newLesson =
            lessons - 1;


        const updateResult =
            await window.db
                .from("students")
                .update({
                    lesson:
                        newLesson
                })
                .eq(
                    "id",
                    student.id
                );


        if (
            updateResult.error
        ) {

            alert(
                "❌ 扣堂失敗！\n\n" +
                updateResult
                    .error
                    .message
            );


            return;
        }


        // ==================================================
        // 建立簽到紀錄
        // ==================================================

        const insertResult =
            await window.db
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


        if (
            insertResult.error
        ) {

            // 加回堂數

            await window.db
                .from("students")
                .update({
                    lesson:
                        lessons
                })
                .eq(
                    "id",
                    student.id
                );


            alert(
                "❌ 建立簽到紀錄失敗！\n\n" +
                insertResult
                    .error
                    .message
            );


            return;
        }


        // ==================================================
        // 成功
        // ==================================================

        currentStudent =
            {
                ...student,

                lesson:
                    newLesson
            };


        updateLessonText();


        alert(
            "🎉 簽到成功！\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
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


        const selectedText =
            document.getElementById(
                "selectedCourseText"
            );


        if (selectedText) {

            selectedText.innerHTML =
                "👆 請選擇下一堂課";
        }


        todayCourses.forEach(
            function (
                course,
                index
            ) {

                const button =
                    document.getElementById(
                        "courseButton" +
                        index
                    );


                if (button) {

                    button.classList.remove(
                        "selected"
                    );
                }

            }
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 6. 管理員登入
// ==================================================

function adminLogin() {

    console.log(
        "🟢 adminLogin()"
    );


    const input =
        document.getElementById(
            "adminPassword"
        );


    if (!input) {

        alert(
            "❌ 找不到管理員密碼"
        );

        return;
    }


    const password =
        input.value;


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


        input.value = "";


        alert(
            "🔓 管理員登入成功！"
        );


    } else {

        alert(
            "❌ 管理員密碼錯誤！"
        );
    }
}


// ==================================================
// 7. 建立課程
// ==================================================

async function createCourse() {

    console.log(
        "🟢 createCourse()"
    );


    const nameInput =
        document.getElementById(
            "courseName"
        );


    const dateInput =
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
        !nameInput ||
        !dateInput ||
        !startInput ||
        !endInput
    ) {

        alert(
            "❌ 找不到課程欄位"
        );

        return;
    }


    const courseName =
        nameInput.value.trim();


    const courseDate =
        dateInput.value;


    const checkinStart =
        startInput.value;


    const checkinEnd =
        endInput.value;


    if (
        courseName === "" ||
        courseDate === "" ||
        checkinStart === "" ||
        checkinEnd === ""
    ) {

        alert(
            "❌ 請把課程資料填寫完整！"
        );

        return;
    }


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
        new Date(endDateTime) <=
        new Date(startDateTime)
    ) {

        alert(
            "❌ 截止時間必須晚於開始時間！"
        );

        return;
    }


    try {

        const result =
            await window.db
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


        if (result.error) {

            console.error(
                result.error
            );


            alert(
                "❌ 建立課程失敗！\n\n" +
                result.error.message
            );


            return;
        }


        alert(
            "🎉 課程建立成功！\n\n" +
            "課程：" +
            result.data.course_name +
            "\n" +
            "日期：" +
            result.data.course_date +
            "\n" +
            "簽到：" +
            checkinStart +
            " ～ " +
            checkinEnd
        );


        nameInput.value =
            "";

        dateInput.value =
            "";

        startInput.value =
            "";

        endInput.value =
            "";


        await loadCourse();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 8. 查詢社員
// ==================================================

async function showStudentAdmin() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到學號輸入框！"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (studentId === "") {

        alert(
            "❌ 請輸入社員學號！"
        );

        return;
    }


    try {

        const result =
            await window.db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (result.error) {

            alert(
                "❌ 查詢失敗！\n\n" +
                result.error.message
            );

            return;
        }


        if (!result.data) {

            alert(
                "❌ 找不到這個社員！"
            );

            return;
        }


        const student =
            result.data;


        alert(
            "👤 社員資料\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "系所：" +
            (
                student.department ||
                "尚未設定"
            ) +
            "\n" +
            "方案：" +
            (
                student.plan ||
                "尚未設定"
            ) +
            "\n" +
            "剩餘堂數：" +
            (
                Number(
                    student.lesson
                ) || 0
            ) +
            " 堂"
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 9. 增加 10 堂
// ==================================================

async function addTenLessons() {

    await addLessons(
        10,
        "10堂"
    );
}


// ==================================================
// 10. 增加 1 堂
// ==================================================

async function addOneLesson() {

    await addLessons(
        1,
        "單堂"
    );
}


// ==================================================
// 共用增加堂數
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
            "❌ 找不到社員學號"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (studentId === "") {

        alert(
            "❌ 請輸入社員學號！"
        );

        return;
    }


    try {

        const result =
            await window.db
                .from("students")
                .select("*")
                .eq(
                    "student ID",
                    studentId
                )
                .maybeSingle();


        if (result.error) {

            alert(
                "❌ 查詢社員失敗！\n\n" +
                result.error.message
            );

            return;
        }


        if (!result.data) {

            alert(
                "❌ 找不到這個社員！"
            );

            return;
        }


        const student =
            result.data;


        const oldLesson =
            Number(
                student.lesson
            ) || 0;


        const newLesson =
            oldLesson + amount;


        const updateResult =
            await window.db
                .from("students")
                .update({
                    plan:
                        planName,

                    lesson:
                        newLesson
                })
                .eq(
                    "id",
                    student.id
                );


        if (
            updateResult.error
        ) {

            alert(
                "❌ 增加堂數失敗！\n\n" +
                updateResult
                    .error
                    .message
            );

            return;
        }


        alert(
            "✅ 增加 " +
            amount +
            " 堂成功！\n\n" +
            "姓名：" +
            student.name +
            "\n" +
            "學號：" +
            student["student ID"] +
            "\n" +
            "目前剩餘：" +
            newLesson +
            " 堂"
        );


    } catch (error) {

        console.error(
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 11. 查看簽到紀錄
// ==================================================

async function loadAttendance() {

    console.log(
        "🟢 loadAttendance()"
    );


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

        const result =
            await window.db
                .from("attendance")
                .select("*")
                .order(
                    "checkin_time",
                    {
                        ascending:
                            false
                    }
                );


        if (result.error) {

            console.error(
                result.error
            );


            list.innerHTML =
                "❌ 載入失敗：<br>" +
                result.error.message;


            return;
        }


        const data =
            result.data || [];


        if (
            data.length ===
            0
        ) {

            list.innerHTML =
                `
                <p
                    style="
                        text-align:center;
                        color:#777;
                    "
                >
                    目前還沒有簽到紀錄。
                </p>
                `;


            return;
        }


        let html =
            `
            <p
                style="
                    text-align:center;
                "
            >
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
                    "無";


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
                    <div
                        class="attendance-card"
                    >

                        <strong>
                            📚 ${
                                escapeHtml(
                                    record.course_name ||
                                    "未知課程"
                                )
                            }
                        </strong>

                        <br>

                        學號：
                        ${
                            escapeHtml(
                                record[
                                    "student ID"
                                ] || ""
                            )
                        }

                        <br>

                        日期：
                        ${
                            escapeHtml(
                                record.course_date ||
                                ""
                            )
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
            "❌ 發生錯誤：<br>" +
            error.message;
    }
}


// ==================================================
// 測試函式
// ==================================================

function testButton() {

    alert(
        "🎉 JavaScript 有正常運作！"
    );
}


console.log(
    "================================"
);

console.log(
    "✅ script.js 已成功載入"
);

console.log(
    "================================"
);
