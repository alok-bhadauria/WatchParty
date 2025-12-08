import os

FILES_NEEDED = {
    "backend/models": [
        "Feedback.js", "MediaState.js", "Message.js", "Participant.js", "Party.js", "User.js"
    ],
    "backend/controllers": [
        "authController.js", "feedbackController.js", "mediaController.js", "messageController.js", "participantController.js", "partyController.js"
    ],
    "backend/routes": [
        "authRoutes.js", "feedbackRoutes.js", "mediaRoutes.js", "messageRoutes.js", "participantRoutes.js", "partyRoutes.js"
    ],
    "backend/middleware": [
        "authMiddleware.js", "errorHandler.js", "optionalAuth.js", "requireHost.js"
    ],
    "backend/socket": [
        "socketServer.js"
    ],
    "backend/utils": [
        "generatePartyCode.js", "responseHandler.js", "validators.js"
    ],
    "backend": [
        "package.json", "server.js"
    ],
    

    "frontend/src/api": [
        "authAPI.js", "axiosInstance.js", "feedbackAPI.js", "mediaAPI.js", "messageAPI.js", "participantAPI.js", "partyAPI.js"
    ],
    "frontend/src/components": [
        "AVPanel.jsx", "BottomSheet.jsx", "ChatBox.jsx", "MobileToolbar.jsx", "Navbar.jsx", "ParticipantList.jsx", "PartyCard.jsx", "ProtectedRoute.jsx", "VideoPlayer.jsx", "Whiteboard.jsx","WindowPanel.jsx"
    ],
    "frontend/src/context": [
        "AuthContext.jsx", "SocketContext.jsx"
    ],
    "frontend/src/data": [
        "avatars.js"
    ],
    "frontend/src/hooks": [
        "useAuth.js", "useSocket.js"
    ],
    "frontend/src/pages": [
        "CreateParty.jsx", "Feedback.jsx", "Home.jsx", "JoinParty.jsx", "Login.jsx", "PartyRoom.jsx", "Profile.jsx", "Register.jsx", "WatchParties.jsx"
    ],
    "frontend/src": [
        "App.jsx", "index.css", "main.jsx"
    ],
    "frontend": [
        "index.html", "package.json", "vite.config.js"
    ]
}


# --------------------------------------------------------------
#   FUNCTION TO SAFELY READ FILE CONTENT
# --------------------------------------------------------------
def read_file(path):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except Exception as e:
        return f"<< Error reading file: {e} >>"


# --------------------------------------------------------------
#   MAIN SCRIPT
# --------------------------------------------------------------
def collect_files():
    base_path = os.getcwd()  # WatchParty folder
    output_path = os.path.join(base_path, "CompleteCode.txt")

    with open(output_path, "w", encoding="utf-8") as out:
        # ============================
        #        BACKEND
        # ============================
        out.write("BACKEND:\n\n")

        for folder, files in FILES_NEEDED.items():
            if not folder.startswith("backend"):
                continue

            out.write(f"{folder}:\n")

            full_folder_path = os.path.join(base_path, folder)

            for filename in files:
                file_path = os.path.join(full_folder_path, filename)
                out.write(f"\n{filename}\n")

                if os.path.exists(file_path):
                    out.write(read_file(file_path))
                else:
                    out.write(f"<< File NOT FOUND: {file_path} >>")

                out.write("\n\n")

            out.write("\n")

        # ============================
        #        FRONTEND
        # ============================
        out.write("\n\nFRONTEND:\n\n")

        for folder, files in FILES_NEEDED.items():
            if not folder.startswith("frontend"):
                continue

            out.write(f"{folder}:\n")

            full_folder_path = os.path.join(base_path, folder)

            for filename in files:
                file_path = os.path.join(full_folder_path, filename)
                out.write(f"\n{filename}\n")

                if os.path.exists(file_path):
                    out.write(read_file(file_path))
                else:
                    out.write(f"<< File NOT FOUND: {file_path} >>")

                out.write("\n\n")

            out.write("\n")

    print("\n✔ CompleteCode.txt has been created successfully!\n")


# Run the script
if __name__ == "__main__":
    collect_files()
