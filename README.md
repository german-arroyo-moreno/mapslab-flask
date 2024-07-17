# MapSlabFlask

## Overview

MapSlabFlask is an advanced online interface that enhances the capabilities of previous hyperspectral data analysis projects. It leverages XRC and XRF data obtained from paintings and pictorial artworks, providing a powerful platform for creating and manipulating maps. This software is specifically designed to assist professionals in art restoration, museums, and chemical analysis by detecting historical changes, identifying forgeries, and more.

## Key Features

- **Advanced Hyperspectral Data Analysis:** MapSlabFlask utilizes XRC and XRF data to generate detailed hyperspectral maps of artworks.

- **User-Friendly Interface:** The intuitive online interface caters to art restoration professionals, museum staff, and chemists.

## How to Use

1. **Upload Artwork Data:** Import hyperspectral data (XRC, XRF) of the artwork for analysis.

2. **Generate Hyperspectral Maps:** Use the tool to create detailed hyperspectral maps, gaining insights into the artwork's composition.

3. **Analyze Temporal Changes:** Explore time-dependent alterations or damages in the artwork.

4. **Forgery Detection:** Detect anomalies that may indicate potential forgeries.

## Getting Started

### Prerequisites

- Ensure you have an NVIDIA GPU in your server and `podman` or `docker` with NVIDIA support installed in your system.
- Ensure you have the necessary hyperspectral data files (XRC, XRF) for the artwork you want to analyze.

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/german-arroyo-moreno/mapslab-flask.git
   ```

2. In the `./core/glew-lib` directory, download glew version 2.10 (`glew-2.1.0.tgz`), or alternatively, set `GLEW_PATH` to the path containing the file in the `./core/Dockerfile`.

3. Create the Docker image in the `./core` directory using the `./core/Dockerfile`. You can use `podman` or `docker`, but take into account that NVIDIA support is mandatory.

## License

MapSlabFlask is licensed under the Apache License 2.0. Please refer to the **LICENSE.md** file for details, and ensure that you also copy the **NOTICE.md** and **CONTRIBUTORS.md** files to reference this work.

## Project Website

Visit the project website at:

<https://calipso.ugr.es/xmapslab.org/>

