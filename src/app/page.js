"use client";
import React, { useState } from "react";

function MainComponent() {
  const [currentView, setCurrentView] = useState("folder-select");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [error, setError] = useState(null);

  const videoExtensions = ["mp4", "webm", "avi", "mov", "mkv", "flv", "m4v"];

  const isVideoFile = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return videoExtensions.includes(extension);
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      const folderStructure = {};

      files.forEach((file) => {
        const pathParts = file.webkitRelativePath.split("/");
        if (pathParts.length >= 4) {
          const subject = pathParts[1];
          const chapter = pathParts[2];
          const fileName = pathParts[pathParts.length - 1];

          if (isVideoFile(fileName)) {
            if (!folderStructure[subject]) {
              folderStructure[subject] = {};
            }
            if (!folderStructure[subject][chapter]) {
              folderStructure[subject][chapter] = [];
            }
            folderStructure[subject][chapter].push({
              name: fileName,
              file: file,
              url: URL.createObjectURL(file),
            });
          }
        }
      });

      const subjectList = Object.keys(folderStructure).map((subject) => ({
        name: subject,
        data: folderStructure[subject],
      }));

      setSubjects(subjectList);
      setCurrentView("subjects");
      setError(null);
    } catch (err) {
      setError("Error reading folder structure");
      console.error(err);
    }
  };

  const handleSubjectClick = (subject) => {
    setCurrentSubject(subject);
    const chapterList = Object.keys(subject.data).map((chapter) => ({
      name: chapter,
      videos: subject.data[chapter],
    }));
    setChapters(chapterList);
    setCurrentView("chapters");
  };

  const handleChapterClick = (chapter) => {
    setCurrentChapter(chapter);
    setVideos(chapter.videos);
    setCurrentView("videos");
  };

  const handleVideoClick = (video) => {
    setCurrentVideo(video);
    setCurrentView("player");
  };

  const handleBack = () => {
    if (currentView === "player") {
      setCurrentView("videos");
      setCurrentVideo(null);
    } else if (currentView === "videos") {
      setCurrentView("chapters");
      setCurrentChapter(null);
      setVideos([]);
    } else if (currentView === "chapters") {
      setCurrentView("subjects");
      setCurrentSubject(null);
      setChapters([]);
    } else if (currentView === "subjects") {
      setCurrentView("folder-select");
      setSubjects([]);
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    if (currentView === "subjects") {
      breadcrumbs.push("PRAYASS");
    } else if (currentView === "chapters") {
      breadcrumbs.push("PRAYASS", currentSubject?.name);
    } else if (currentView === "videos") {
      breadcrumbs.push("PRAYASS", currentSubject?.name, currentChapter?.name);
    } else if (currentView === "player") {
      breadcrumbs.push(
        "PRAYASS",
        currentSubject?.name,
        currentChapter?.name,
        currentVideo?.name
      );
    }
    return breadcrumbs;
  };

  const renderFolderSelect = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <i className="fas fa-folder-open text-6xl text-blue-500 mb-4"></i>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            PRAYASS Video Browser
          </h1>
          <p className="text-gray-600">
            Select your PRAYASS folder to browse videos
          </p>
        </div>

        <label className="block">
          <input
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderSelect}
            className="hidden"
          />
          <div className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-colors duration-200 inline-block">
            <i className="fas fa-upload mr-2"></i>
            Select PRAYASS Folder
          </div>
        </label>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  const renderSubjects = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <nav className="text-sm breadcrumbs mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <i className="fas fa-chevron-right mx-2 text-xs"></i>
                  )}
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "text-blue-600 font-semibold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </nav>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Choose Subject
          </h1>
          <p className="text-gray-600">Select a subject to view chapters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subjects.map((subject, index) => {
            const icons = ["fa-calculator", "fa-atom", "fa-flask"];
            const colors = ["bg-green-500", "bg-purple-500", "bg-orange-500"];
            return (
              <div
                key={subject.name}
                onClick={() => handleSubjectClick(subject)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 p-8 text-center"
              >
                <div
                  className={`${colors[index]} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <i className={`fas ${icons[index]} text-3xl text-white`}></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {subject.name}
                </h3>
                <p className="text-gray-600">
                  {Object.keys(subject.data).length} chapters available
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleBack}
          className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Folder Selection
        </button>
      </div>
    </div>
  );

  const renderChapters = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <nav className="text-sm breadcrumbs mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <i className="fas fa-chevron-right mx-2 text-xs"></i>
                  )}
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "text-blue-600 font-semibold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </nav>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {currentSubject?.name} Chapters
          </h1>
          <p className="text-gray-600">Select a chapter to view videos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.name}
              onClick={() => handleChapterClick(chapter)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-6"
            >
              <div className="flex items-center mb-3">
                <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                  <i className="fas fa-book text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {chapter.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {chapter.videos.length} videos
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBack}
          className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Subjects
        </button>
      </div>
    </div>
  );

  const renderVideos = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <nav className="text-sm breadcrumbs mb-4">
            <div className="flex items-center space-x-2 text-gray-600">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <i className="fas fa-chevron-right mx-2 text-xs"></i>
                  )}
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "text-blue-600 font-semibold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </nav>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {currentChapter?.name}
          </h1>
          <p className="text-gray-600">Click on a video to play</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map((video, index) => (
            <div
              key={video.name}
              onClick={() => handleVideoClick(video)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-4"
            >
              <div className="flex items-center">
                <div className="bg-red-500 w-16 h-16 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <i className="fas fa-play text-white text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {video.name}
                  </h3>
                  <p className="text-gray-600 text-sm">Video file</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBack}
          className="mt-8 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Chapters
        </button>
      </div>
    </div>
  );

  const renderPlayer = () => (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <nav className="text-sm breadcrumbs mb-4">
            <div className="flex items-center space-x-2 text-gray-300">
              {getBreadcrumbs().map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <i className="fas fa-chevron-right mx-2 text-xs"></i>
                  )}
                  <span
                    className={
                      index === getBreadcrumbs().length - 1
                        ? "text-white font-semibold"
                        : ""
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>
          </nav>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <video
            src={currentVideo?.url}
            controls
            className="w-full h-auto max-h-[70vh]"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {currentVideo?.name}
            </h1>
            <p className="text-gray-400">
              {currentSubject?.name} • {currentChapter?.name}
            </p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Videos
        </button>
      </div>
    </div>
  );

  if (currentView === "folder-select") return renderFolderSelect();
  if (currentView === "subjects") return renderSubjects();
  if (currentView === "chapters") return renderChapters();
  if (currentView === "videos") return renderVideos();
  if (currentView === "player") return renderPlayer();

  return null;
}

export default MainComponent;