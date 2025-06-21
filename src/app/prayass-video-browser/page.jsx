"use client";
import React from "react";

function MainComponent() {
  const [currentView, setCurrentView] = useState("folder-selection");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderStructure, setFolderStructure] = useState({});
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentSubBranch, setCurrentSubBranch] = useState(null);

  // Function to handle folder selection
  const handleFolderSelect = async () => {
    try {
      console.log("Folder selection clicked");

      if ("showDirectoryPicker" in window) {
        console.log("Using File System Access API");
        // Use File System Access API for modern browsers
        const dirHandle = await window.showDirectoryPicker();
        console.log("Directory selected:", dirHandle);
        setSelectedFolder(dirHandle);
        await scanFolderStructure(dirHandle);
        setCurrentView("home");
      } else {
        console.log("Using fallback file input method");
        // Fallback for older browsers
        const input = document.createElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.multiple = true;
        input.accept = "*/*";

        input.onchange = (e) => {
          console.log("Files selected:", e.target.files.length);
          const files = Array.from(e.target.files);
          if (files.length > 0) {
            processFolderFromFiles(files);
            setCurrentView("home");
          } else {
            console.log("No files selected");
          }
        };

        input.onerror = (e) => {
          console.error("File input error:", e);
        };

        // Add to DOM temporarily to ensure it works
        document.body.appendChild(input);
        input.click();

        // Clean up after a delay
        setTimeout(() => {
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);

      // If user cancels, don't show error
      if (error.name === "AbortError") {
        console.log("User cancelled folder selection");
        return;
      }

      // Show user-friendly error message
      alert(
        "Unable to select folder. Please try again or use a different browser (Chrome/Edge recommended)."
      );
    }
  };

  // Scan folder structure using File System Access API
  const scanFolderStructure = async (dirHandle) => {
    const structure = {};

    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") {
        structure[name] = {
          name: name,
          color: getSubjectColor(name),
          icon: getSubjectIcon(name),
          chapters: [],
          subBranches: {},
        };

        // Scan subject folder
        for await (const [subName, subHandle] of handle.entries()) {
          if (subHandle.kind === "directory") {
            // Check if this is a sub-branch or direct chapter
            const hasSubFolders = await checkForSubFolders(subHandle);

            if (hasSubFolders) {
              // This is a sub-branch
              structure[name].subBranches[subName] = [];
              for await (const [chapterName] of subHandle.entries()) {
                structure[name].subBranches[subName].push(chapterName);
              }
            } else {
              // This is a direct chapter
              structure[name].chapters.push(subName);
            }
          }
        }
      }
    }

    setFolderStructure(structure);
  };

  // Process folder from file list (fallback method)
  const processFolderFromFiles = (files) => {
    const structure = {};

    files.forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/");
      if (pathParts.length >= 2) {
        const subject = pathParts[1]; // Skip root folder name

        if (!structure[subject]) {
          structure[subject] = {
            name: subject,
            color: getSubjectColor(subject),
            icon: getSubjectIcon(subject),
            chapters: [],
            subBranches: {},
          };
        }

        if (pathParts.length >= 3) {
          const chapterOrBranch = pathParts[2];

          if (pathParts.length >= 4) {
            // This has sub-branches
            if (!structure[subject].subBranches[chapterOrBranch]) {
              structure[subject].subBranches[chapterOrBranch] = [];
            }
            const chapter = pathParts[3];
            if (
              !structure[subject].subBranches[chapterOrBranch].includes(chapter)
            ) {
              structure[subject].subBranches[chapterOrBranch].push(chapter);
            }
          } else {
            // Direct chapter
            if (!structure[subject].chapters.includes(chapterOrBranch)) {
              structure[subject].chapters.push(chapterOrBranch);
            }
          }
        }
      }
    });

    setFolderStructure(structure);
  };

  // Helper function to check if a directory has subdirectories
  const checkForSubFolders = async (dirHandle) => {
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === "directory") {
        return true;
      }
    }
    return false;
  };

  // Get subject color based on name
  const getSubjectColor = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("math")) return "bg-blue-500";
    if (lowerName.includes("physics")) return "bg-purple-500";
    if (lowerName.includes("chemistry") || lowerName.includes("chem"))
      return "bg-green-500";
    if (lowerName.includes("biology") || lowerName.includes("bio"))
      return "bg-emerald-500";
    if (lowerName.includes("english")) return "bg-red-500";
    if (lowerName.includes("history")) return "bg-yellow-500";
    return "bg-gray-500"; // Default color
  };

  // Get subject icon based on name
  const getSubjectIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("math")) return "fa-calculator";
    if (lowerName.includes("physics")) return "fa-atom";
    if (lowerName.includes("chemistry") || lowerName.includes("chem"))
      return "fa-flask";
    if (lowerName.includes("biology") || lowerName.includes("bio"))
      return "fa-leaf";
    if (lowerName.includes("english")) return "fa-book";
    if (lowerName.includes("history")) return "fa-landmark";
    return "fa-folder"; // Default icon
  };

  // Render folder selection screen
  const renderFolderSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <div className="mb-8">
            <i className="fas fa-folder-open text-6xl text-indigo-500 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">PRAYASS</h1>
            <p className="text-gray-600">
              Select your PRAYASS folder to get started
            </p>
          </div>

          <button
            onClick={handleFolderSelect}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center text-lg"
          >
            <i className="fas fa-folder mr-3"></i>
            Select PRAYASS Folder
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Choose the folder containing your study materials
          </p>
        </div>
      </div>
    </div>
  );

  // Update getVideoFiles to work with actual folder structure
  const getVideoFiles = (subject, chapter, subBranch = null) => {
    // This would need to be implemented to actually read files from the selected folder
    // For now, return mock data similar to before
    const basePath = subBranch
      ? `${subject}/${subBranch}/${chapter}`
      : `${subject}/${chapter}`;

    const videoFiles = [
      {
        name: "Lecture 1",
        video: `${basePath}/lecture1.mp4`,
        pdf: `${basePath}/lecture1.pdf`,
      },
      {
        name: "Lecture 2",
        video: `${basePath}/lecture2.mp4`,
        pdf: `${basePath}/lecture2.pdf`,
      },
      {
        name: "Lecture 3",
        video: `${basePath}/lecture3.mp4`,
        pdf: `${basePath}/lecture3.pdf`,
      },
    ];

    return videoFiles;
  };

  const handleSubjectClick = (subjectKey) => {
    setCurrentSubject(subjectKey);
    if (
      folderStructure[subjectKey].subBranches &&
      Object.keys(folderStructure[subjectKey].subBranches).length > 0
    ) {
      setCurrentView("sub-branches");
    } else {
      setCurrentView("chapters");
    }
  };

  const handleSubBranchClick = (subBranch) => {
    setCurrentSubBranch(subBranch);
    setCurrentView("chapters");
  };

  const handleChapterClick = (chapter) => {
    setCurrentChapter(chapter);
    setCurrentView("videos");
  };

  const handleBack = () => {
    if (currentView === "videos") {
      setCurrentView("chapters");
      setCurrentChapter(null);
    } else if (currentView === "chapters") {
      if (currentSubBranch) {
        setCurrentView("sub-branches");
        setCurrentSubBranch(null);
      } else {
        setCurrentView("home");
        setCurrentSubject(null);
      }
    } else if (currentView === "sub-branches") {
      setCurrentView("home");
      setCurrentSubject(null);
      setCurrentSubBranch(null);
    } else if (currentView === "home") {
      setCurrentView("folder-selection");
      setSelectedFolder(null);
      setFolderStructure({});
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = ["PRAYASS"];
    if (currentSubject)
      breadcrumbs.push(folderStructure[currentSubject]?.name || currentSubject);
    if (currentSubBranch) breadcrumbs.push(currentSubBranch);
    if (currentChapter) breadcrumbs.push(currentChapter);
    return breadcrumbs;
  };

  const renderHome = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-indigo-500">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-5xl font-bold text-gray-800 tracking-wide">
                PRAYASS
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Your Complete Learning Platform
              </p>
            </div>
            <button
              onClick={() => setCurrentView("folder-selection")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <i className="fas fa-folder mr-2"></i>
              Change Folder
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Choose Your Subject
          </h2>
          <p className="text-gray-600 text-lg">
            Select a subject to start your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(folderStructure).map(([key, subject]) => (
            <div
              key={key}
              onClick={() => handleSubjectClick(key)}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-3 overflow-hidden group"
            >
              {/* Card Image/Icon */}
              <div
                className={`${subject.color} h-48 flex items-center justify-center relative overflow-hidden`}
              >
                <i
                  className={`fas ${subject.icon} text-6xl text-white group-hover:scale-110 transition-transform duration-300`}
                ></i>
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>

              {/* Card Content */}
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {subject.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {Object.keys(subject.subBranches).length > 0
                    ? `${
                        Object.keys(subject.subBranches).length
                      } branches with chapters`
                    : `${subject.chapters.length} chapters`}
                </p>
                <div className="flex items-center justify-center text-indigo-600 font-semibold">
                  <span>Explore</span>
                  <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform duration-300"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderSubBranches = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <nav className="text-sm mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <i className="fas fa-chevron-right mx-2 text-xs"></i>
                  )}
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "text-green-600 font-semibold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </nav>
          <h1 className="text-4xl font-bold text-gray-800">
            {folderStructure[currentSubject]?.name} Branches
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(
            folderStructure[currentSubject]?.subBranches || {}
          ).map(([branch, chapters]) => (
            <div
              key={branch}
              onClick={() => handleSubBranchClick(branch)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
            >
              <div className="text-center">
                <div
                  className={`${folderStructure[currentSubject].color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <i
                    className={`fas ${folderStructure[currentSubject].icon} text-2xl text-white`}
                  ></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {branch}
                </h3>
                <p className="text-gray-600">{chapters.length} chapters</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBack}
          className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Subjects
        </button>
      </main>
    </div>
  );

  const renderChapters = () => {
    const chapters = currentSubBranch
      ? folderStructure[currentSubject]?.subBranches[currentSubBranch] || []
      : folderStructure[currentSubject]?.chapters || [];

    const subjectColor =
      folderStructure[currentSubject]?.color || "bg-gray-500";
    const borderColor = subjectColor.replace("bg-", "border-");

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className={`bg-white shadow-lg border-b-4 ${borderColor}`}>
          <div className="max-w-6xl mx-auto px-6 py-6">
            <nav className="text-sm mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                {getBreadcrumbs().map((crumb, index) => (
                  <span key={index} className="flex items-center">
                    {index > 0 && (
                      <i className="fas fa-chevron-right mx-2 text-xs"></i>
                    )}
                    <span
                      className={
                        index === getBreadcrumbs().length - 1
                          ? "text-indigo-600 font-semibold"
                          : ""
                      }
                    >
                      {crumb}
                    </span>
                  </span>
                ))}
              </div>
            </nav>
            <h1 className="text-4xl font-bold text-gray-800">
              {currentSubBranch
                ? `${currentSubBranch} Chapters`
                : `${folderStructure[currentSubject]?.name} Chapters`}
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter, index) => (
              <div
                key={chapter}
                onClick={() => handleChapterClick(chapter)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6"
              >
                <div className="flex items-center">
                  <div
                    className={`${subjectColor} w-14 h-14 rounded-lg flex items-center justify-center mr-4`}
                  >
                    <i className="fas fa-book text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {chapter}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Video lectures available
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
        </main>
      </div>
    );
  };

  const renderVideos = () => {
    const videos = getVideoFiles(
      currentSubject,
      currentChapter,
      currentSubBranch
    );
    const subjectColor =
      folderStructure[currentSubject]?.color || "bg-gray-500";
    const borderColor = subjectColor.replace("bg-", "border-");

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className={`bg-white shadow-lg border-b-4 ${borderColor}`}>
          <div className="max-w-6xl mx-auto px-6 py-6">
            <nav className="text-sm mb-4">
              <div className="flex items-center space-x-2 text-gray-600">
                {getBreadcrumbs().map((crumb, index) => (
                  <span key={index} className="flex items-center">
                    {index > 0 && (
                      <i className="fas fa-chevron-right mx-2 text-xs"></i>
                    )}
                    <span
                      className={
                        index === getBreadcrumbs().length - 1
                          ? "text-indigo-600 font-semibold"
                          : ""
                      }
                    >
                      {crumb}
                    </span>
                  </span>
                ))}
              </div>
            </nav>
            <h1 className="text-4xl font-bold text-gray-800">
              {currentChapter}
            </h1>
            <p className="text-gray-600 mt-2">
              Video lectures and study materials
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <div
                key={video.name}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
              >
                {/* Video Thumbnail */}
                <div className="relative mb-4">
                  <video
                    className="w-full h-40 object-cover rounded-lg bg-gray-200"
                    poster="images/video-thumbnail.jpg"
                  >
                    <source src={video.video} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                    <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center">
                      <i className="fas fa-play text-white text-xl ml-1"></i>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {video.name}
                </h3>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <a
                    href={video.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Watch Video
                  </a>
                  <a
                    href={video.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                  >
                    <i className="fas fa-file-pdf mr-2"></i>
                    View PDF
                  </a>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Chapters
          </button>
        </main>
      </div>
    );
  };

  // Render based on current view
  if (currentView === "folder-selection") return renderFolderSelection();
  if (currentView === "home") return renderHome();
  if (currentView === "sub-branches") return renderSubBranches();
  if (currentView === "chapters") return renderChapters();
  if (currentView === "videos") return renderVideos();

  return null;
}

export default MainComponent;