const directoryGrid = document.getElementById("directory-grid");
const directoryStatus = document.getElementById("directory-status");
const userCount = document.getElementById("user-count");
const albumCount = document.getElementById("album-count");

const createRawToggle = (data) => {
	const wrapper = document.createElement("div");
	wrapper.className = "mt-4";

	const button = document.createElement("button");
	button.type = "button";
	button.className = "text-sm font-medium text-stone-700 hover:text-stone-900";
	button.textContent = "View raw JSON";
	button.setAttribute("aria-expanded", "false");

	const pre = document.createElement("pre");
	pre.className = "mt-3 hidden rounded-lg bg-white/70 p-3 text-xs leading-relaxed text-stone-700 whitespace-pre-wrap";
	pre.textContent = JSON.stringify(data, null, 2);

	button.addEventListener("click", () => {
		const isHidden = pre.classList.toggle("hidden");
		button.textContent = isHidden ? "View raw JSON" : "Hide raw JSON";
		button.setAttribute("aria-expanded", String(!isHidden));
	});

	wrapper.appendChild(button);
	wrapper.appendChild(pre);

	return wrapper;
};

const createUserCard = (user, albums) => {
	const card = document.createElement("article");
	card.className = "rounded-2xl border border-stone-200 bg-white/95 p-6 shadow-md";

	const header = document.createElement("div");
	header.className = "flex items-start justify-between gap-4";

	const identity = document.createElement("div");
	const name = document.createElement("h3");
	name.className = "font-display text-xl font-semibold text-stone-900";
	name.textContent = user.name || "Unnamed user";

	const username = document.createElement("p");
	username.className = "mt-1 text-sm text-stone-500";
	username.textContent = `@${user.username || "unknown"}`;

	identity.appendChild(name);
	identity.appendChild(username);

	const badge = document.createElement("span");
	badge.className = "rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500";
	badge.textContent = `User #${user.id ?? "?"}`;

	header.appendChild(identity);
	header.appendChild(badge);

	const details = document.createElement("div");
	details.className = "mt-4 grid gap-2 text-sm text-stone-700";
	details.innerHTML = `
		<div><span class="text-stone-500">Email:</span> ${user.email || "N/A"}</div>
		<div><span class="text-stone-500">Phone:</span> ${user.phone || "N/A"}</div>
		<div><span class="text-stone-500">Website:</span> ${user.website || "N/A"}</div>
		<div><span class="text-stone-500">Company:</span> ${user.company?.name || "N/A"}</div>
		<div><span class="text-stone-500">City:</span> ${user.address?.city || "N/A"}</div>
	`;

	const albumBlock = document.createElement("div");
	albumBlock.className = "mt-5 rounded-xl bg-stone-100/80 p-4";

	const albumTitle = document.createElement("p");
	albumTitle.className = "text-xs font-semibold uppercase tracking-[0.2em] text-stone-500";
	albumTitle.textContent = `Albums (${albums.length})`;

	const albumList = document.createElement("ul");
	albumList.className = "mt-3 grid gap-2 text-sm text-stone-700";
	const preview = albums.slice(0, 3);
	if (preview.length === 0) {
		const item = document.createElement("li");
		item.className = "text-stone-500";
		item.textContent = "No albums available.";
		albumList.appendChild(item);
	} else {
		preview.forEach((album) => {
			const item = document.createElement("li");
			item.className = "rounded-lg bg-white/80 px-3 py-2";
			item.textContent = album.title;
			albumList.appendChild(item);
		});
	}

	albumBlock.appendChild(albumTitle);
	albumBlock.appendChild(albumList);

	card.appendChild(header);
	card.appendChild(details);
	card.appendChild(albumBlock);
	card.appendChild(createRawToggle({ user, albums }));

	return card;
};

const renderDirectory = (users, albums) => {
	if (!directoryGrid) {
		return;
	}

	directoryGrid.innerHTML = "";
	const albumsByUser = albums.reduce((map, album) => {
		const key = album.userId;
		if (!map.has(key)) {
			map.set(key, []);
		}
		map.get(key).push(album);
		return map;
	}, new Map());

	users.forEach((user) => {
		const userAlbums = albumsByUser.get(user.id) || [];
		directoryGrid.appendChild(createUserCard(user, userAlbums));
	});
};

const setStatus = (message) => {
	if (directoryStatus) {
		directoryStatus.textContent = message;
	}
};

const loadDirectory = async () => {
	try {
		const [usersResponse, albumsResponse] = await Promise.all([
			fetch("https://jsonplaceholder.typicode.com/users"),
			fetch("https://jsonplaceholder.typicode.com/albums")
		]);

		if (!usersResponse.ok || !albumsResponse.ok) {
			setStatus("Unable to load directory data.");
			return;
		}

		const [users, albums] = await Promise.all([
			usersResponse.json(),
			albumsResponse.json()
		]);

		if (userCount) {
			userCount.textContent = `Users: ${users.length}`;
		}
		if (albumCount) {
			albumCount.textContent = `Albums: ${albums.length}`;
		}

		renderDirectory(users, albums);
	} catch (error) {
		setStatus("Unable to load directory data.");
	}
};

loadDirectory();
