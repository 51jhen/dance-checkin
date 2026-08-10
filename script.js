```javascript
// ==================================================
// 社課簽到系統 script.js
// 固定系級版本
// ==================================================


// ==================================================
// Supabase 設定
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


console.log(
    "✅ Supabase db 建立成功！"
);


// ==================================================
// 固定系級
// ==================================================
//
// 如果以後要改系級
// 只需要修改這一行
//

const FIXED_DEPARTMENT =
    "工業一丙";


// ==================================================
// 全域變數
// ==================================================

let todayCourses = [];

let selectedCourse = null;


// ==================================================
// 1. 載入今天課程
// ==================================================

async function loadCourse() {

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


    try {

        const now =
            new Date();


        const today =
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
            ).format(now);


        console.log(
            "📅 今天日期：",
            today
        );


        const {
            data: courses,
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
                "❌ 課程載入錯誤：",
                error
            );


            courseInfo.innerHTML =
                "❌ 課程載入失敗<br>" +
                error.message;


            return;
        }


        todayCourses =
            courses || [];


        if (
            todayCourses.length === 0
        ) {

            courseInfo.innerHTML =
                "📚 今天沒有社課";

            return;
        }


        let html = "";


        html += `
            <div
                style="
                    font-size:18px;
                    font-weight:bold;
                    margin-bottom:15px;
                "
            >
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


                html += `

                    <button
                        type="button"
                        id="courseButton${index}"
                        class="course-button"
                    >

                        <span
                            class="course-name"
                        >
                            📚 ${
                                course.course_name
                            }
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


        html += `

            <div
                id="selectedCourseText"
                class="selected-course"
            >
                👆 請先選擇要簽到的課程
            </div>

        `;


        courseInfo.innerHTML =
            html;


        // ==================================================
        // 綁定課程按鈕
        // ==================================================

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


                button.addEventListener(
                    "click",
                    function() {

                        console.log(
                            "📱 點擊課程：",
                            index
                        );


                        selectCourse(
                            index
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.error(error);


        courseInfo.innerHTML =
            "❌ 課程載入失敗<br>" +
            error.message;
    }
}


// ==================================================
// 2. 選擇課程
// ==================================================

function selectCourse(index) {

    console.log(
        "👉 selectCourse：",
        index
    );


    if (
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
        "✅ 已選擇：",
        selectedCourse.course_name
    );


    // 更新按鈕外觀

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
}


// ==================================================
// 3. 社員登入
// ==================================================

async function login() {

    const nameElement =
        document.getElementById(
            "name"
        );


    const studentIdElement =
        document.getElementById(
            "loginStudentId"
        );


    if (!nameElement) {

        alert(
            "❌ 找不到姓名輸入框！"
        );

        return;
    }


    if (!studentIdElement) {

        alert(
            "❌ 找不到學號輸入框！"
        );

        return;
    }


    const name =
        nameElement.value.trim();


    const studentId =
        studentIdElement.value.trim();


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
        // 找不到 → 建立新社員
        // ==================================================

        if (!student) {

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
                                FIXED_DEPARTMENT,

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

                "目前堂數：" +
                (
                    Number(
                        newStudent.lesson
                    ) || 0
                ) +
                " 堂"
            );


            return;
        }


        // ==================================================
        // 已存在
        // ==================================================

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
// 4. 顯示社員資料
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


    studentInfo.style.display =
        "block";


    welcomeText.innerHTML =
        "👋 歡迎 " +
        student.name +
        "<br>" +
        "<span style='font-size:14px;color:#666;'>" +
        "系級：" +
        FIXED_DEPARTMENT +
        "</span>";


    lessonText.innerText =
        "目前剩餘堂數：" +
        (
            Number(
                student.lesson
            ) || 0
        ) +
        " 堂";


    if (
        todayCourses.length > 0 &&
        !selectedCourse
    ) {

        alert(
            "👆 請先選擇今天要上的課程！"
        );
    }
}


// ==================================================
// 5. 社員簽到
// ==================================================

async function checkIn() {

    const studentIdElement =
        document.getElementById(
            "loginStudentId"
        );


    if (!studentIdElement) {

        alert(
            "❌ 找不到學號輸入框！"
        );

        return;
    }


    const studentId =
        studentIdElement.value.trim();


    if (studentId === "") {

        alert(
            "❌ 請先輸入學號！"
        );

        return;
    }


    if (!selectedCourse) {

        alert(
            "📚 請先選擇你今天要上的課程！"
        );

        return;
    }


    try {

        const course =
            selectedCourse;


        // ==================================================
        // 檢查簽到時間
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

                "開始時間：" +
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
                course.course_name +
                "\n" +

                "截止時間：" +
                endTime.toLocaleString(
                    "zh-TW",
                    {
                        timeZone:
                            "Asia/Taipei"
                    }
                )
            );


            return;
        }


        // ==================================================
        // 查詢社員
        // ==================================================

        const {
            data: student,
            error: studentError
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
                "❌ 找不到社員資料！\n\n" +
                "請先按「繼續」登入。"
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


        if (lessons <= 0) {

            alert(
                "❌ 目前沒有剩餘堂數！"
            );

            return;
        }


        // ==================================================
        // 檢查是否已簽到
        // ==================================================

        const {
            data: existingAttendance,
            error: attendanceCheckError
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
            attendanceCheckError
        ) {

            alert(
                "❌ 簽到紀錄查詢失敗！\n\n" +
                attendanceCheckError.message
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
        // 扣一堂
        // ==================================================

        const newLesson =
            lessons - 1;


        const {
            error: updateError
        } =
            await db
                .from("students")
                .update({
                    lesson:
                        newLesson
                })
                .eq(
                    "id",
                    student.id
                );


        if (updateError) {

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
                insertAttendanceError
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


        if (
            insertAttendanceError
        ) {

            await db
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
                "❌ 簽到紀錄建立失敗！\n\n" +
                insertAttendanceError.message
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
                "目前剩餘堂數：" +
                newLesson +
                " 堂";
        }


        alert(
            "🎉 簽到成功！\n\n" +

            "姓名：" +
            student.name +

            "\n" +

            "學號：" +
            student["student ID"] +

            "\n" +

            "系級：" +
            FIXED_DEPARTMENT +

            "\n" +

            "課程：" +
            course.course_name +

            "\n" +

            "使用：1 堂" +

            "\n" +

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


    } catch (error) {

        console.error(error);


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

    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    if (!passwordElement) {

        return;
    }


    const password =
        passwordElement.value;


    const ADMIN_PASSWORD =
        "06020602";


    if (
        password ===
        ADMIN_PASSWORD
    ) {

        document.getElementById(
            "adminArea"
        ).style.display =
            "block";


        alert(
            "🔓 管理員登入成功！"
        );


        passwordElement.value =
            "";


    } else {

        alert(
            "❌ 管理員密碼錯誤！"
        );
    }
}


// ==================================================
// 7. 管理員：查詢社員
// ==================================================

async function showStudentAdmin() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到管理員學號輸入框！"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (
        studentId === ""
    ) {

        alert(
            "❌ 請輸入社員學號！"
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
                FIXED_DEPARTMENT
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

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 8. 管理員：增加 10 堂
// ==================================================

async function addTenLessons() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到社員學號輸入框！"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (
        studentId === ""
    ) {

        alert(
            "❌ 請輸入社員學號！"
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
                "❌ 查詢社員失敗！\n\n" +
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


        const oldLesson =
            Number(
                student.lesson
            ) || 0;


        const newLesson =
            oldLesson + 10;


        const {
            error:
                updateError
        } =
            await db
                .from("students")
                .update({

                    plan:
                        "10堂",

                    lesson:
                        newLesson

                })
                .eq(
                    "id",
                    student.id
                );


        if (updateError) {

            alert(
                "❌ 增加 10 堂失敗！\n\n" +
                updateError.message
            );

            return;
        }


        alert(
            "✅ 增加 10 堂成功！\n\n" +

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

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 9. 管理員：增加 1 堂
// ==================================================

async function addOneLesson() {

    const input =
        document.getElementById(
            "adminStudentId"
        );


    if (!input) {

        alert(
            "❌ 找不到社員學號輸入框！"
        );

        return;
    }


    const studentId =
        input.value.trim();


    if (
        studentId === ""
    ) {

        alert(
            "❌ 請輸入社員學號！"
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
                "❌ 查詢社員失敗！\n\n" +
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


        const oldLesson =
            Number(
                student.lesson
            ) || 0;


        const newLesson =
            oldLesson + 1;


        const {
            error:
                updateError
        } =
            await db
                .from("students")
                .update({

                    plan:
                        "單堂",

                    lesson:
                        newLesson

                })
                .eq(
                    "id",
                    student.id
                );


        if (updateError) {

            alert(
                "❌ 增加 1 堂失敗！\n\n" +
                updateError.message
            );

            return;
        }


        alert(
            "✅ 增加 1 堂成功！\n\n" +

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

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 10. 管理員：建立課程
// ==================================================

async function createCourse() {

    const courseNameElement =
        document.getElementById(
            "courseName"
        );

    const courseDateElement =
        document.getElementById(
            "courseDate"
        );

    const checkinStartElement =
        document.getElementById(
            "checkinStart"
        );

    const checkinEndElement =
        document.getElementById(
            "checkinEnd"
        );


    if (
        !courseNameElement ||
        !courseDateElement ||
        !checkinStartElement ||
        !checkinEndElement
    ) {

        alert(
            "❌ 找不到課程欄位！"
        );

        return;
    }


    const courseName =
        courseNameElement.value.trim();


    const courseDate =
        courseDateElement.value;


    const checkinStart =
        checkinStartElement.value;


    const checkinEnd =
        checkinEndElement.value;


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
            new Date(endDateTime) <=
            new Date(startDateTime)
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


        await loadCourse();


        courseNameElement.value =
            "";

        courseDateElement.value =
            "";

        checkinStartElement.value =
            "";

        checkinEndElement.value =
            "";


    } catch (error) {

        console.error(error);


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==================================================
// 11. 管理員：查看簽到紀錄
// ==================================================

async function loadAttendance() {

    const attendanceList =
        document.getElementById(
            "attendanceList"
        );


    if (!attendanceList) {

        return;
    }


    attendanceList.innerHTML =
        "⏳ 載入簽到紀錄中...";


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

            attendanceList.innerHTML =
                "❌ 載入失敗：<br>" +
                error.message;

            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            attendanceList.innerHTML =
                "<p style='text-align:center;'>" +
                "目前還沒有簽到紀錄。" +
                "</p>";

            return;
        }


        let html = "";


        html +=
            "<p style='text-align:center;'>" +
            "目前共有 <strong>" +
            data.length +
            "</strong> 筆簽到紀錄" +
            "</p>";


        data.forEach(
            function(record) {

                const time =
                    record.checkin_time
                        ? new Date(
                            record.checkin_time
                        ).toLocaleString(
                            "zh-TW",
                            {
                                timeZone:
                                    "Asia/Taipei"
                            }
                        )
                        : "未知";


                html += `

                    <div
                        class="attendance-card"
                    >

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


        attendanceList.innerHTML =
            html;


    } catch (error) {

        console.error(error);


        attendanceList.innerHTML =
            "❌ 發生錯誤：<br>" +
            error.message;
    }
}


// ==================================================
// 12. 網頁載入
// ==================================================

loadCourse();


console.log(
    "✅ 社課簽到系統已載入"
);
```
