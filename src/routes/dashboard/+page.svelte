
<div class="dashboard-container">
  <div class="logo">Math Maze</div>
  
  <div class="start-button">
    <a href="/game">
      <button class="btn btn-primary">START GAME</button>
    </a>
  </div>
  
  <div class="view-progress-button">
    <button class="btn btn-secondary">View Progress</button>
  </div>
</div>

<style>
  .dashboard-container {
    background: var(--background-green);
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .logo {
    color: var(--text-color);
    font-family: "NovaFlat-Book", sans-serif;
    font-size: 5rem;
    line-height: 1.2;
    font-weight: 400;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .start-button button {
    padding: 14px 24px;
    width: 20rem;
    height: 6rem;
    font-size: 2rem;
  }
  
  .view-progress-button {
    margin-top: 2rem;
  }
  
  .view-progress-button button {
    padding: 10px 20px;
    font-size: 1rem;
  }
</style>
