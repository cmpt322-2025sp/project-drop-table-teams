<script lang="ts">
  import { Button, TabGroup, Tab, TabContent } from '$lib/components';
  
  // Get data from server
  let { data } = $props();
  let { user, profile, gameSessions, summaryStats } = $derived(data);
  
  // Use real user data or fallback to mock data
  let studentData = $derived({
    name: user?.email?.split('@')[0] || 'Student',
    level: profile?.level || 1,
    points: profile?.points || 0
  });
  
  // Function to format time from seconds to readable format
  function formatTime(seconds: number): string {
    // Round to integer first
    seconds = Math.round(seconds);

    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Navigate back to dashboard
  function navigateToDashboard() {
    window.location.href = '/private/student/dashboard';
  }
</script>

<header class="student-header">
  <div class="logo">Math Maze</div>
  <div class="user-info">
    <div class="user-avatar">
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
    <div class="user-details">
      <div class="user-name">{studentData.name}</div>
      <div class="user-role">Level {studentData.level} • {studentData.points} points</div>
    </div>
  </div>
</header>

<main class="student-content">
  <h1>My Progress</h1>
  <div class="back-button">
    <Button variant="secondary" size="sm" onClick={navigateToDashboard}>Back to Dashboard</Button>
  </div>
  
  {#if summaryStats}
    <!-- Summary Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{summaryStats.totalSessions}</div>
        <div class="stat-label">Total Games Played</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{summaryStats.successRate.toFixed(1)}%</div>
        <div class="stat-label">Math Problem Success Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{summaryStats.completionRate.toFixed(1)}%</div>
        <div class="stat-label">Maze Completion Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{formatTime(summaryStats.totalTimeSeconds)}</div>
        <div class="stat-label">Total Play Time</div>
      </div>
    </div>
    
    <!-- Detailed Stats Tabs -->
    <TabGroup>
      <Tab>Game History</Tab>
      <Tab>Problem Solving Stats</Tab>
      
      <TabContent>
        <!-- Game History Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Problems Solved</th>
                <th>Time Played</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {#each gameSessions as session}
                <tr>
                  <td>{formatDate(session.created_at)}</td>
                  <td>{session.problems_solved} / {session.problems_total}</td>
                  <td>{formatTime(session.time_spent_seconds)}</td>
                  <td>
                    {#if session.completed}
                      <span class="completed">✓</span>
                    {:else}
                      <span class="not-completed">✗</span>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </TabContent>
      
      <TabContent>
        <!-- Problem Solving Stats -->
        <div class="problem-stats">
          <div class="problem-summary">
            <div class="problems-solved">
              <div class="big-number">{summaryStats.totalSolved} / {summaryStats.totalProblems}</div>
              <div class="label">Total Problems Solved</div>
            </div>
            
            <div class="success-rate">
              <div class="progress-circle" style="--percentage: {summaryStats.successRate}">
                <div class="progress-circle-inner">
                  <span>{summaryStats.successRate.toFixed(1)}%</span>
                </div>
              </div>
              <div class="label">Success Rate</div>
            </div>
          </div>
          
          <h3>Errors By Problem Type</h3>
          <div class="error-stats">
            <div class="error-bars">
              <div class="error-bar">
                <div class="error-value" style="height: {Math.min(100, summaryStats.avgWrongAddition * 10)}%"></div>
                <span class="error-label">Addition</span>
                <span class="error-count">{summaryStats.avgWrongAddition.toFixed(1)}</span>
              </div>
              <div class="error-bar">
                <div class="error-value" style="height: {Math.min(100, summaryStats.avgWrongSubtraction * 10)}%"></div>
                <span class="error-label">Subtraction</span>
                <span class="error-count">{summaryStats.avgWrongSubtraction.toFixed(1)}</span>
              </div>
              <div class="error-bar">
                <div class="error-value" style="height: {Math.min(100, summaryStats.avgWrongPlace * 10)}%"></div>
                <span class="error-label">Placement</span>
                <span class="error-count">{summaryStats.avgWrongPlace.toFixed(1)}</span>
              </div>
            </div>
            <div class="error-explanation">
              <p>The chart shows the average number of errors per game session for each problem type.</p>
              <p>Lower numbers are better!</p>
            </div>
          </div>
        </div>
      </TabContent>
    </TabGroup>
  {:else}
    <div class="no-data">
      <div class="no-data-message">
        <h2>No Game Data Yet</h2>
        <p>Play some games to see your stats here!</p>
        <Button variant="primary" onClick={navigateToDashboard}>Start Playing</Button>
      </div>
    </div>
  {/if}
</main>

<style>
  .student-header {
    background-color: var(--background-green);
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .logo {
    font-family: 'NovaFlat-Book', sans-serif;
    font-size: 2rem;
    font-weight: 700;
  }

  .user-info {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .user-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin-right: 0.75rem;
    color: white;
  }

  .user-details {
    display: flex;
    flex-direction: column-reverse;
  }

  .user-name {
    font-weight: 600;
    font-size: 1rem;
  }

  .user-role {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .student-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  h1 {
    color: #333;
    font-size: 2rem;
    margin-bottom: 1rem;
    display: inline-block;
  }

  .back-button {
    float: right;
    margin-top: 0.5rem;
  }

  /* Stats cards */
  .stats-cards {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: white;
    border-radius: 10px;
    padding: 1.2rem;
    flex: 1;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: transform 0.3s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-card .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: var(--background-green);
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-card .stat-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }

  /* Table styles */
  .table-container {
    overflow-x: auto;
    margin-bottom: 2rem;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background-color: var(--background-green);
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover {
    background-color: #f9f9f9;
  }

  .completed {
    color: var(--background-green);
    font-weight: bold;
  }

  .not-completed {
    color: #ff6b6b;
  }

  /* Problem stats */
  .problem-stats {
    padding: 1.5rem;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .problem-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
  }

  .problems-solved, .success-rate {
    text-align: center;
  }

  .big-number {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--background-green);
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 1rem;
    color: #666;
  }

  /* Progress circle */
  .progress-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(
      var(--background-green) calc(var(--percentage) * 1%),
      #eee calc(var(--percentage) * 1%) 100%
    );
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  .progress-circle-inner {
    width: 90px;
    height: 90px;
    background: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--background-green);
  }

  /* Error stats */
  h3 {
    text-align: center;
    margin: 2rem 0 1rem;
    color: #555;
  }

  .error-stats {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .error-bars {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 150px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .error-bar {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    width: 60px;
    position: relative;
  }

  .error-value {
    width: 100%;
    background-color: #ff6b6b;
    border-radius: 5px 5px 0 0;
    min-height: 2px;
  }

  .error-label {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .error-count {
    position: absolute;
    top: -25px;
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
  }
  
  .error-explanation {
    text-align: center;
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #666;
    max-width: 500px;
  }

  /* No data state */
  .no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .no-data-message {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .no-data-message h2 {
    margin-bottom: 1rem;
    color: #555;
  }

  .no-data-message p {
    margin-bottom: 1.5rem;
    color: #777;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .student-header {
      padding: 1rem;
      flex-direction: column-reverse;
      gap: 1rem;
    }

    .student-content {
      padding: 1.5rem;
    }

    .stats-cards {
      flex-direction: column-reverse;
    }

    .problem-summary {
      flex-direction: column;
      gap: 2rem;
    }
    
    h1 {
      display: block;
      text-align: center;
    }
    
    .back-button {
      float: none;
      text-align: center;
      margin-bottom: 1.5rem;
    }
  }
</style>