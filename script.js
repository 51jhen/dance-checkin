// ==================================================
// 社課簽到系統 script.js
// ==================================================


// ==================================================
// 1. 載入今天課程
// ==================================================

async function loadCourse() {

    const courseInfo =
        document.getElementById("courseInfo");


    if (!courseInfo) {
        console.error("找不到 courseInfo");
        return;
    }


    try {

        const today =
            new Date().toLocaleDateString(
                "en-CA",
                {
                    timeZone: "Asia/Taipei"
                }
            );


        console.log("今天日期：", today);


        const {
            data: courses,
            error
        } = await db
            .from("courses")
            .select("*")
            .eq("course_date", today)
            .order(
                "checkin_start",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "課程查詢錯誤：",
                error
            );

            courseInfo.innerHTML =
                "❌ 課程載入失敗<br>" +
                error.message;

            return;
        }


        console.log(
            "今天課程：",
            courses
        );


        if (
            !courses ||
            courses.length === 0
        ) {

            courseInfo.innerText =
                "今天沒有社課";

            return;
        }


        let html = "";

        courses.forEach(
            function(course) {

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
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );


                const endText =
                    end.toLocaleTimeString(
                        "zh-TW",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );


                html += `
                    <div class="course-card">

                        <strong>
                            📚 ${course.course_name}
                        </strong>

                        <br>

                        📅 ${course.course_date}

                        <br>

                        ⏰ 簽到時間：
                        ${startText}
                        ～ 
                        ${endText}

                    </div>
                `;
            }
        );


        courseInfo.innerHTML = html;


    } catch (error) {

        console.error(error);

        courseInfo.innerText =
            "❌ 課程載入失敗";
    }
}



// ==================================================
// 2. 社員登入
// ==================================================

async function login() {

    console.log(
        "========== 開始社員登入 =========="
    );


    const nameElement =
        document.getElementById("name");


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


    console.log(
        "姓名：",
        name
    );


    console.log(
        "學號：",
        studentId
    );


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
        } = await db
            .from("students")
            .select("*")
            .eq(
                "student ID",
                studentId
            )
            .maybeSingle();


        if (error) {

            console.error(
                "查詢社員錯誤：",
                error
            );


            alert(
                "❌ 查詢社員失敗！\n\n" +
                error.message
            );

            return;
        }


        // ==========================================
        // 找不到 → 建立社員
        // ==========================================

        if (!student) {

            console.log(
                "找不到社員，建立新社員"
            );


            const {
                data: newStudent,
                error: insertError
            } = await db
                .from("students")
                .insert([
                    {
                        name: name,

                        "student ID":
                            studentId,

                        department: "",

                        plan: "",

                        lesson: 0
                    }
                ])
                .select()
                .single();


            if (insertError) {

                console.error(
                    "建立社員錯誤：",
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


        // ==========================================
        // 找到社員
        // ==========================================

        showStudent(student);


        alert(
            "✅ 登入成功！"
        );


    } catch (error) {

        console.error(
            "社員登入錯誤：",
            error
        );


        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}



// ==================================================
// 3. 顯示社員資料
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
            "找不到社員資料區"
        );

        return;
    }


    studentInfo.style.display =
        "block";


    welcomeText.innerText =
        "👋 歡迎 " +
        student.name;


    lessonText.innerText =
        "目前剩餘堂數：" +
        (
            Number(
                student.lesson
            ) || 0
        ) +
        " 堂";
}



// ==================================================
// 4. 社員簽到
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


    try {

        const today =
            new Date().toLocaleDateString(
                "en-CA",
                {
                    timeZone:
                        "Asia/Taipei"
                }
            );


        // ==========================================
        // 找今天所有課程
        // ==========================================

        const {
            data: courses,
            error: courseError
        } = await db
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


        if (courseError) {

            console.error(
                courseError
            );


            alert(
                "❌ 課程查詢失敗！\n\n" +
                courseError.message
            );

            return;
        }


        if (
            !courses ||
            courses.length === 0
        ) {

            alert(
                "❌ 今天沒有社課！"
            );

            return;
        }


        // ==========================================
        // 找現在正在簽到的課程
        // ==========================================

        const now =
            new Date();


        const activeCourses =
            courses.filter(
                function(course) {

                    const start =
                        new Date(
                            course.checkin_start
                        );

                    const end =
                        new Date(
                            course.checkin_end
                        );


                    return (
                        now >= start &&
                        now <= end
                    );
                }
            );


        if (
            activeCourses.length === 0
        ) {

            alert(
                "⏰ 現在沒有正在簽到的課程！"
            );

            return;
        }


        if (
            activeCourses.length > 1
        ) {

            alert(
                "⚠️ 目前有多堂課同時開放簽到，請確認課程設定。"
            );

            return;
        }


        const course =
            activeCourses[0];


        // ==========================================
        // 查詢社員
        // ==========================================

        const {
            data: student,
            error: studentError
        } = await db
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


        // ==========================================
        // 檢查堂數
        // ==========================================

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


        // ==========================================
        // 檢查是否已簽到
        // ==========================================

        const {
            data: existingAttendance,
            error:
                attendanceCheckError
        } = await db
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
                "⚠️ 你已經簽到過這堂課了！"
            );

            return;
        }


        // ==========================================
        // 扣一堂
        // ==========================================

        const newLesson =
            lessons - 1;


        const {
            error: updateError
        } = await db
            .from("students")
            .update({
                lesson: newLesson
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


        // ==========================================
        // 建立簽到紀錄
        // ==========================================

        const {
            error:
                insertAttendanceError
        } = await db
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


            alert(
                "⚠️ 堂數已扣除，但簽到紀錄建立失敗！\n\n" +
                insertAttendanceError.message
            );

            return;
        }


        // ==========================================
        // 更新畫面
        // ==========================================

        document.getElementById(
            "lessonText"
        ).innerText =
            "目前剩餘堂數：" +
            newLesson +
            " 堂";


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
// 5. 管理員登入
// ==================================================

function adminLogin() {

    const password =
        document.getElementById(
            "adminPassword"
        ).value;


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


        document.getElementById(
            "adminPassword"
        ).value = "";


    } else {

        alert(
            "❌ 管理員密碼錯誤！"
        );
    }
}



// ==================================================
// 6. 管理員：增加 10 堂
// ==================================================

async function addTenLessons() {

    await addLessons(
        10,
        "10堂"
    );
}



// ==================================================
// 7. 管理員：增加 1 堂
// ==================================================

async function addOneLesson() {

    await addLessons(
        1,
        "單堂"
    );
}



// ==================================================
// 8. 管理員：增加堂數共用函式
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
            "❌ 找不到社員學號輸入框！"
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

        const {
            data: student,
            error
        } = await db
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
            oldLesson + amount;


        const {
            error: updateError
        } = await db
            .from("students")
            .update({
                plan: planName,
                lesson: newLesson
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
                "❌ 增加堂數失敗！\n\n" +
                updateError.message
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
// 9. 管理員：建立課程
// ==================================================

async function createCourse() {

    const courseName =
        document.getElementById(
            "courseName"
        ).value.trim();


    const courseDate =
        document.getElementById(
            "courseDate"
        ).value;


    const checkinStart =
        document.getElementById(
            "checkinStart"
        ).value;


    const checkinEnd =
        document.getElementById(
            "checkinEnd"
        ).value;


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
        } = await db
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


        document.getElementById(
            "courseName"
        ).value = "";


        document.getElementById(
            "courseDate"
        ).value = "";


        document.getElementById(
            "checkinStart"
        ).value = "";


        document.getElementById(
            "checkinEnd"
        ).value = "";
        

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
// 10. 管理員：查看簽到紀錄
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
        } = await db
            .from("attendance")
            .select("*")
            .order(
                "checkin_time",
                {
                    ascending: false
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
                "<p style='text-align:center;'>" +
                "目前還沒有簽到紀錄。" +
                "</p>";

            return;
        }


        let html =
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
                        : "無";


                html += `

                    <div style="
                        border:1px solid #ddd;
                        border-radius:10px;
                        padding:12px;
                        margin-top:10px;
                        background:#fafafa;
                    ">

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

        console.error(
            error
        );


        attendanceList.innerHTML =
            "❌ 發生錯誤：<br>" +
            error.message;
    }
}



// ==================================================
// 11. 網頁載入
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "✅ 網頁載入完成"
        );


        console.log(
            "Supabase db：",
            db
        );


        loadCourse();
    }
);



// ==================================================
// 12. 測試
// ==================================================

console.log(
    "✅ 社課簽到系統 script.js 已載入"
);