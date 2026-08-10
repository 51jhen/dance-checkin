async function loadCourse() {

    const courseInfo =
        document.getElementById("courseInfo");

    try {

        const today = new Date()
            .toLocaleDateString("en-CA", {
                timeZone: "Asia/Taipei"
            });

        const { data: courses, error } = await db
            .from("courses")
            .select("*")
            .eq("course_date", today)
            .order("checkin_start", {
                ascending: true
            });

        if (error) {

            console.error(error);

            courseInfo.innerText =
                "❌ 課程載入失敗";

            return;
        }

        if (!courses || courses.length === 0) {

            courseInfo.innerText =
                "今天沒有社課";

            return;
        }

        const course = courses[0];

        const start = new Date(course.checkin_start);
        const end = new Date(course.checkin_end);

        const dateText =
            course.course_date;

        const startText =
            start.toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit"
            });

        const endText =
            end.toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit"
            });

        courseInfo.innerHTML =
            course.course_name +
            "<br>" +
            dateText +
            "<br>" +
            "簽到時間：" +
            startText +
            " ～ " +
            endText;

    } catch (error) {

        console.error(error);

        courseInfo.innerText =
            "❌ 課程載入失敗";
    }
}
async function login() {

    const name = document.getElementById("name").value.trim();
    const studentId = document.getElementById("studentId").value.trim();

    if (name === "" || studentId === "") {
        alert("請輸入姓名和學號！");
        return;
    }

    try {

        const { data, error } = await db
            .from("students")
            .select("*")
            .eq("student ID", studentId)
            .maybeSingle();

        if (error) {
            console.error(error);

            alert(
                "❌ 查詢失敗！\n\n" +
                error.message
            );

            return;
        }

        // 找不到社員 → 建立
        if (!data) {

            const { data: newStudent, error: insertError } = await db
                .from("students")
                .insert([
                    {
                        name: name,
                        "student ID": studentId,
                        department: "",
                        plan: "",
                        lesson: 0
                    }
                ])
                .select()
                .single();

            if (insertError) {
                console.error(insertError);

                alert(
                    "❌ 建立社員失敗！\n\n" +
                    insertError.message
                );

                return;
            }

            showStudent(newStudent);
            return;
        }

        // 找到社員
        showStudent(data);

    } catch (error) {

        console.error(error);

        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}


// ==============================
// 顯示社員資料
// ==============================

function showStudent(student) {

    document.getElementById("studentInfo").style.display = "block";

    document.getElementById("welcomeText").innerText =
        "👋 歡迎 " + student.name;

    document.getElementById("lessonText").innerText =
        "目前剩餘堂數：" + (student.lesson || 0) + " 堂";
}


// ==============================
// 社員簽到
// ==============================

async function checkIn() {

    const studentId =
        document.getElementById("studentId").value.trim();

    if (studentId === "") {
        alert("請先輸入學號！");
        return;
    }

    try {

        // ==============================
        // 1. 找目前的課程
        // ==============================

        const today = new Date()
            .toLocaleDateString("en-CA", {
                timeZone: "Asia/Taipei"
            });

        const { data: courses, error: courseError } = await db
            .from("courses")
            .select("*")
            .eq("course_date", today);

        if (courseError) {
            console.error(courseError);

            alert(
                "❌ 課程查詢失敗！\n\n" +
                courseError.message
            );

            return;
        }

        if (!courses || courses.length === 0) {
            alert("❌ 今天沒有社課！");
            return;
        }

        const course = courses[0];

        // ==============================
        // 2. 檢查簽到時間
        // ==============================

        const now = new Date();

        const startTime = new Date(course.checkin_start);
        const endTime = new Date(course.checkin_end);

        if (now < startTime) {

            alert(
                "⏰ 尚未開始簽到！\n\n" +
                "開始時間：" +
                startTime.toLocaleString("zh-TW")
            );

            return;
        }

        if (now > endTime) {

            alert(
                "⛔ 簽到時間已截止！\n\n" +
                "截止時間：" +
                endTime.toLocaleString("zh-TW")
            );

            return;
        }

        // ==============================
        // 3. 查詢社員
        // ==============================

        const { data: student, error: studentError } = await db
            .from("students")
            .select("*")
            .eq("student ID", studentId)
            .maybeSingle();

        if (studentError) {

            alert(
                "❌ 查詢社員失敗！\n\n" +
                studentError.message
            );

            return;
        }

        if (!student) {
            alert("❌ 找不到社員資料！");
            return;
        }

        // ==============================
        // 4. 檢查堂數
        // ==============================

        const lessons = student.lesson || 0;

        if (lessons <= 0) {

            alert(
                "❌ 目前沒有剩餘堂數！"
            );

            return;
        }

        // ==============================
        // 5. 檢查今天是否已簽到
        // ==============================

        const { data: existingAttendance, error: attendanceCheckError } =
            await db
                .from("attendance")
                .select("id")
                .eq("student ID", studentId)
                .eq("course_date", course.course_date)
                .maybeSingle();

        if (attendanceCheckError) {

            alert(
                "❌ 簽到紀錄查詢失敗！\n\n" +
                attendanceCheckError.message
            );

            return;
        }

        if (existingAttendance) {

            alert(
                "⚠️ 你今天已經簽到過了！"
            );

            return;
        }

        // ==============================
        // 6. 扣一堂
        // ==============================

        const newLesson = lessons - 1;

        const { error: updateError } = await db
            .from("students")
            .update({
                lesson: newLesson
            })
            .eq("id", student.id);

        if (updateError) {

            alert(
                "❌ 扣堂失敗！\n\n" +
                updateError.message
            );

            return;
        }

        // ==============================
        // 7. 建立簽到紀錄
        // ==============================

        const { error: insertAttendanceError } = await db
            .from("attendance")
            .insert([
                {
                    "student ID": studentId,
                    course_name: course.course_name,
                    course_date: course.course_date
                }
            ]);

        if (insertAttendanceError) {

            console.error(insertAttendanceError);

            alert(
                "⚠️ 堂數已扣除，但簽到紀錄建立失敗！\n\n" +
                insertAttendanceError.message
            );

            return;
        }

        // ==============================
        // 8. 更新畫面
        // ==============================

        document.getElementById("lessonText").innerText =
            "目前剩餘堂數：" + newLesson + " 堂";

        alert(
            "🎉 簽到成功！\n\n" +
            "姓名：" + student.name + "\n" +
            "課程：" + course.course_name + "\n" +
            "使用：1 堂\n" +
            "剩餘：" + newLesson + " 堂"
        );

    } catch (error) {

        console.error(error);

        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}
loadCourse();
// ==============================
// 管理員：建立課程
// ==============================

async function createCourse() {

    const courseName =
        document.getElementById("courseName").value.trim();

    const courseDate =
        document.getElementById("courseDate").value;

    const checkinStart =
        document.getElementById("checkinStart").value;

    const checkinEnd =
        document.getElementById("checkinEnd").value;

    if (
        courseName === "" ||
        courseDate === "" ||
        checkinStart === "" ||
        checkinEnd === ""
    ) {
        alert("請把課程資料填寫完整！");
        return;
    }

    try {

        // 組成台灣時間
        const startDateTime =
            courseDate + "T" + checkinStart + ":00+08:00";

        const endDateTime =
            courseDate + "T" + checkinEnd + ":00+08:00";

        // 檢查時間
        if (
            new Date(endDateTime) <=
            new Date(startDateTime)
        ) {
            alert("❌ 簽到截止時間必須晚於開始時間！");
            return;
        }

        // 建立課程
        const { data, error } = await db
            .from("courses")
            .insert([
                {
                    course_name: courseName,
                    course_date: courseDate,
                    checkin_start: startDateTime,
                    checkin_end: endDateTime
                }
            ])
            .select()
            .single();

        if (error) {

            console.error(error);

            alert(
                "❌ 建立課程失敗！\n\n" +
                error.message
            );

            return;
        }

        alert(
            "🎉 課程建立成功！\n\n" +
            "課程：" + data.course_name + "\n" +
            "日期：" + data.course_date + "\n" +
            "簽到時間：" +
            checkinStart +
            " ～ " +
            checkinEnd
        );

        // 如果建立的是今天的課程
        // 立即更新網頁上的課程資訊
        loadCourse();

        // 清空輸入框
        document.getElementById("courseName").value = "";
        document.getElementById("courseDate").value = "";
        document.getElementById("checkinStart").value = "";
        document.getElementById("checkinEnd").value = "";

    } catch (error) {

        console.error(error);

        alert(
            "❌ 發生錯誤！\n\n" +
            error.message
        );
    }
}
// ==============================
// 管理員登入
// ==============================

function adminLogin() {

    const password =
        document.getElementById("adminPassword").value;

    // 測試用管理員密碼
    const ADMIN_PASSWORD = "123456";

    if (password === ADMIN_PASSWORD) {

        document.getElementById("adminArea").style.display =
            "block";

        alert("🔓 管理員登入成功！");

        document.getElementById("adminPassword").value = "";

    } else {

        alert("❌ 管理員密碼錯誤！");
    }
}
// ==============================
// 管理員：查看簽到紀錄
// ==============================

async function loadAttendance() {

    const attendanceList =
        document.getElementById("attendanceList");

    attendanceList.innerHTML =
        "⏳ 載入簽到紀錄中...";

    try {

        const { data, error } = await db
            .from("attendance")
            .select("*")
            .order("checkin_time", {
                ascending: false
            });

        if (error) {

            console.error(error);

            attendanceList.innerHTML =
                "❌ 載入失敗：<br>" +
                error.message;

            return;
        }

        if (!data || data.length === 0) {

            attendanceList.innerHTML =
                "<p style='text-align:center;'>目前還沒有簽到紀錄。</p>";

            return;
        }

        let html = "";

        html +=
            "<p style='text-align:center;'>" +
            "目前共有 <strong>" +
            data.length +
            "</strong> 筆簽到紀錄" +
            "</p>";

        data.forEach(function (record) {

            const time =
                new Date(record.checkin_time)
                    .toLocaleString("zh-TW", {
                        timeZone: "Asia/Taipei"
                    });

            html += `
                <div style="
                    border:1px solid #ddd;
                    border-radius:10px;
                    padding:12px;
                    margin-top:10px;
                    background:#fafafa;
                ">

                    <strong>
                        ${record.course_name}
                    </strong>

                    <br>

                    學號：
                    ${record["student ID"]}

                    <br>

                    日期：
                    ${record.course_date}

                    <br>

                    簽到時間：
                    ${time}

                </div>
            `;

        });

        attendanceList.innerHTML = html;

    } catch (error) {

        console.error(error);

        attendanceList.innerHTML =
            "❌ 發生錯誤：<br>" +
            error.message;
    }
}
