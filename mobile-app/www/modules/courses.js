// ============================================================
// COURSES MODULE
// ============================================================

async function renderCoursesPage() {
  return `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="goBack()">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1.2rem;">📚 ${t('myCourses')}</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <div id="coursesList">
          <div class="loader">
            <div class="spinner"></div>
            <p>${t('loading')}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderCoursesPageContent() {
  const courses = await getCourses({
    system: State.profile.system,
    level: State.profile.level
  });
  
  if (!courses || courses.length === 0) {
    return `
      <div class="card" style="text-align: center; padding: 30px;">
        <p style="color: var(--text-secondary);">${t('noData')}</p>
      </div>
    `;
  }
  
  return courses.map(course => `
    <div class="card" style="cursor: pointer; margin-bottom: 12px;" onclick="showCourseDetail('${course.id}')">
      <div style="display: flex; gap: 15px;">
        <div style="font-size: 2rem;">${course.icon || '📖'}</div>
        <div style="flex: 1;">
          <h4 style="margin-bottom: 5px; font-weight: 700;">${course.title}</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${course.instructor || 'Instructeur'}
          </p>
          <div style="background: var(--bg-hover); height: 6px; border-radius: 3px; overflow: hidden;">
            <div style="background: var(--primary); height: 100%; width: ${course.progress || 0}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function showCourseDetail(courseId) {
  const course = await getCourseDetails(courseId);
  const dashboardContent = document.getElementById('dashboardContent');
  
  if (!course) {
    showToast('Cours non trouvé', 'error');
    return;
  }
  
  dashboardContent.innerHTML = `
    <div class="dashboard-container">
      <div class="navbar">
        <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.9rem;" onclick="renderCoursesPage(); loadCoursesContent();">
          ← ${t('back')}
        </button>
        <h1 style="font-size: 1rem;">📚</h1>
      </div>

      <div class="container" style="padding: 15px; overflow-y: auto;">
        <div class="card">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 4rem; margin-bottom: 15px;">${course.icon || '📖'}</div>
            <h2 style="font-size: 1.8rem; margin-bottom: 10px; font-weight: 800;">${course.title}</h2>
            <p style="color: var(--text-secondary); margin-bottom: 15px;">${course.description || ''}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: var(--bg-hover); padding: 15px; border-radius: 10px; text-align: center;">
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">Niveau</p>
              <p style="font-size: 1.2rem; font-weight: 700;">${course.level || 'Débutant'}</p>
            </div>
            <div style="background: var(--bg-hover); padding: 15px; border-radius: 10px; text-align: center;">
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 5px;">Leçons</p>
              <p style="font-size: 1.2rem; font-weight: 700;">${course.lessons || 0}</p>
            </div>
          </div>

          <h3 style="margin-bottom: 15px; font-weight: 700;">Programme</h3>
          <div style="background: var(--bg-hover); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            ${course.lessons ? `
              <ol style="margin: 0; padding-left: 20px;">
                ${Array(Math.min(course.lessons, 5)).fill(0).map((_, i) => `
                  <li style="margin-bottom: 8px;">Leçon ${i + 1}</li>
                `).join('')}
              </ol>
              ${course.lessons > 5 ? `<p style="margin-top: 10px; color: var(--text-secondary);">... et ${course.lessons - 5} autres</p>` : ''}
            ` : '<p style="color: var(--text-secondary);">Pas de leçons disponibles</p>'}
          </div>

          <button class="btn btn-primary" style="width: 100%; margin-bottom: 10px; font-size: 1.1rem; padding: 15px;" 
            onclick="handleEnrollCourse('${course.id}', '${course.title}')">
            S'inscrire à ce cours
          </button>
          <button class="btn btn-secondary" style="width: 100%;" onclick="goBack()">
            ${t('back')}
          </button>
        </div>

        <div style="height: 30px;"></div>
      </div>
    </div>
  `;
}

async function handleEnrollCourse(courseId, courseTitle) {
  const success = await enrollCourse(courseId);
  if (success) {
    showToast(`Inscrit à "${courseTitle}"!`, 'success');
    setTimeout(() => {
      showDashboard();
    }, 1000);
  }
}

function loadCoursesContent() {
  renderCoursesPageContent().then(content => {
    const coursesList = document.getElementById('coursesList');
    if (coursesList) {
      coursesList.innerHTML = content;
    }
  });
}
