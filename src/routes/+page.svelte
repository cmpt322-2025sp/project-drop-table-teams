<h2>Welcome to</h2>
<h1>Math Maze</h1>
<br>
<br>
<p style="font-size:125%">This is soon to be the login page for this game. 
    This game is still under development!
</p>
<a href="http://localhost:5173/dashboard"><button>Jump to the Dashboard</button></a>

<style>

    h1 {
        text-align: center;
        font-size: 500%;   
    }

    h2 {
        text-align: center;
    }
    button {
        background: #ff9d00;
      border-radius: 8px;
      padding: 14px 24px 14px 24px;
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
      justify-content: center;
      width: 400px;
      height: 100px;
      position: absolute;
      left: 460px;
      top: 350px;
      text-align: center;
      font-size: 75%;
      color: #000000;
      font-family: "NovaFlat-Book", sans-serif;
    }

    button:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
	}

    button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

    button::after {
		content: '';
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		width: 100%;
		height: 100%;
		left: -100%;
		top: 0;
		border-radius: 50px;
		z-index: -1;
		transition: all 0.4s ease;
	}

    button:hover::after {
		left: 0;
	}
</style>