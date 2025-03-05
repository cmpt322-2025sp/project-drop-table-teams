
<script lang="ts">
  import { Button } from '$lib/components';
</script>

<div class="dashboard-container">
  <div class="logo">Math Maze</div>
  
  <div class="start-button">
    <a href="/game">
      <Button 
        variant="primary" 
        size="lg" 
        width="24rem" 
        height="8rem" 
        fontSize="2.5rem"
      >
        START GAME
      </Button>
    </a>
  </div>
  
  <div class="view-progress-button">
    <Button variant="secondary" size="md" rounded={true}>View Progress</Button>
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
  
  .view-progress-button {
    margin-top: 2rem;
  }
</style>
