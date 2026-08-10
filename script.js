// ==================================================
// 社課簽到系統 script.js
// 完整版
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
// 全域變數
// ==================================================

let todayCourses = [];

let selectedCourse = null;

let currentStudent = null;


// ==================================================
// 1. 載入今天所有課程
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
                        ascending:
                            true
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
                `
                <div class="course-title">
                    📚 今日社課
                </div>

                <div
                    style="
                        text-align:center;
                        color:#666;
                        padding:20px 0;
                    "
                >
                    今天沒有社課
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
                        id="courseButton${index}"
                        class="course-button"
                    >

                        <span class="course-name">
                            📚 ${escapeHtml(
                                course.course_name
                            )}
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


        // ==================================================
        // 綁定按鈕
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
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();

                        console.log(
                            "🖱️ 點擊課程：",
                            index
                        );


                        selectCourse(index);
                    }
                );


                button.addEventListener(
                    "touchend",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();

                        console.log(
                            "📱 Touch 課程：",
                            index
                        );


                        selectCourse(index);
                    },
                    {
                        passive:
                            false
                    }
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ loadCourse 發生錯誤：",
            error
        );


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
        "✅ 已選擇：",
        selectedCourse
    );


    // ==================================================
    // 更新按鈕
    // ==================================================

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


            button.classList.remove(
                "selected"
            );


            if (i === index) {

                button.classList.add(
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
            "✅ 已選擇：<strong>" +
            escapeHtml(
                selectedCourse.course_name
            ) +
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


    const departmentElement =
        document.getElementById(
            "loginDepartment"
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


    if (!departmentElement) {

        alert(
            "❌ 找不到系級輸入框！"
        );

        return;
    }


    const name =
        nameElement.value.trim();


    const studentId =
        studentIdElement.value.trim();


    const department =
        departmentElement.value.trim();


    // ==================================================
    // 檢查
    // ==================================================

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


    if (department === "") {

        alert(
            "❌ 請輸入系級！"
        );

        return;
    }


    console.log(
        "👤 登入：",
        name,
        studentId,
        department
    );


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

        currentStudent =
            student;


        // 如果資料庫原本沒有系級
        // 就把這次輸入的系級補進去

        if (
            !student.department ||
            student.department.trim() === ""
        ) {

            const {
                data:
                    updatedStudent,
                error:
                    updateError
            } =
                await db
                    .from("students")
                    .update({
                        department:
                            department
                    })
                    .eq(
                        "id",
                        student.id
                    )
                    .select()
                    .single();


            if (!updateError &&
                updatedStudent
            ) {

                currentStudent =
                    updatedStudent;
            }
        }


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
        escapeHtml(
            student.name
        );


    lessonText.innerHTML =
        "🎓 系級：" +
        escapeHtml(
            student.department ||
            "尚未設定"
        ) +
        "<br>" +
        "目前剩餘堂數：" +
        (
            Number(
                student.lesson
            ) || 0
        ) +
        " 堂";


    // ==================================================
    // 如果今天有課但還沒選
    // ==================================================

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


    // ==================================================
    // 必須選課
    // ==================================================

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
                course.course_name +
                "\n" +
                "截止：" +
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

            console.error(
                studentError
            );


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
            data:
                existingAttendance,
            error:
                attendanceCheckError
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


        if (attendanceCheckError) {

            console.error(
                attendanceCheckError
            );


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
                    "id",
                    student.id
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

            console.error(
                insertAttendanceError
            );


            // 簽到紀錄失敗
            // 把堂數加回去

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

            lessonText.innerHTML =
                "🎓 系級：" +
                escapeHtml(
                    student.department ||
                    "尚未設定"
                ) +
                "<br>" +
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
            (
                student.department ||
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


        // ==================================================
        // 清除選課
        // ==================================================

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
            function(course, index) {

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
// 6. 管理員：建立課程
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
            "❌ 找不到課程輸入欄位！"
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
// 7. 管理員登入
// ==================================================

function adminLogin() {

    const passwordElement =
        document.getElementById(
            "adminPassword"
        );


    if (!passwordElement) {

        alert(
            "❌ 找不到管理員密碼輸入框！"
        );

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


        passwordElement.value =
            "";


    } else {

        alert(
            "❌ 管理員密碼錯誤！"
        );
    }
}


// ==================================================
// 8. 管理員：查詢社員
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

            console.error(
                error
            );


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
// 9. 管理員：增加 10 堂
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

            console.error(
                error
            );


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

            console.error(
                updateError
            );


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
// 10. 管理員：增加 1 堂
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

            console.error(
                error
            );


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

            console.error(
                updateError
            );


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
// 11. 管理員：查看簽到紀錄
// ==================================================

async function loadAttendance() {

    const attendanceList =
        document.getElementById(
            "attendanceList"
        );


    if (!attendanceList) {

        console.error(
            "❌ 找不到 attendanceList"
        );

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

            console.error(
                error
            );


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
                `
                <p
                    style="
                        text-align:center;
                    "
                >
                    目前還沒有簽到紀錄。
                </p>
                `;


            return;
        }


        let html = "";


        html +=
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
                                record["student ID"] ||
                                ""
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
                        ${
                            escapeHtml(
                                time
                            )
                        }

                    </div>
                    `;
            }
        );


        attendanceList.innerHTML =
            html;


    } catch (error) {

        console.error(
            error
        );


        attendanceList.innerHTML =
            "❌ 發生錯誤：<br>" +
            error.message;
    }
}


// ==================================================
// 12. HTML 安全處理
// ==================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
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
// 13. 網頁載入
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


console.log(
    "✅ 完整版 script.js 已載入"
);
