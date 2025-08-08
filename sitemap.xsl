<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>JivanJyoti Foundation - XML Sitemap</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"/>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sitemap-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .url-item { transition: all 0.3s ease; }
        .url-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .priority-high { border-left: 4px solid #10b981; }
        .priority-medium { border-left: 4px solid #f59e0b; }
        .priority-low { border-left: 4px solid #6b7280; }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">
    <!-- Header -->
    <header class="bg-green-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-green-200">
                    <i class="fas fa-sitemap mr-3"></i>JivanJyoti Foundation
                </h1>
                <p class="text-xl mt-2 text-green-100">XML Sitemap</p>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="sitemap-container py-12">
        <div class="bg-white rounded-lg shadow-xl p-8 mb-8">
            <div class="text-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">Website Structure</h2>
                <p class="text-gray-600">This XML sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs for search engines to crawl and index.</p>
            </div>
            
            <!-- Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                    <i class="fas fa-link text-green-600 text-3xl mb-2"></i>
                    <h3 class="text-xl font-semibold text-green-800">Total URLs</h3>
                    <p class="text-2xl font-bold text-green-600"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></p>
                </div>
                <div class="bg-blue-50 p-6 rounded-lg text-center border border-blue-200">
                    <i class="fas fa-calendar text-blue-600 text-3xl mb-2"></i>
                    <h3 class="text-xl font-semibold text-blue-800">Last Updated</h3>
                    <p class="text-lg font-bold text-blue-600">2025-01-04</p>
                </div>
                <div class="bg-purple-50 p-6 rounded-lg text-center border border-purple-200">
                    <i class="fas fa-search text-purple-600 text-3xl mb-2"></i>
                    <h3 class="text-xl font-semibold text-purple-800">SEO Ready</h3>
                    <p class="text-lg font-bold text-purple-600">Optimized</p>
                </div>
            </div>
        </div>

        <!-- URL List -->
        <div class="bg-white rounded-lg shadow-xl overflow-hidden">
            <div class="bg-green-800 text-white p-4">
                <h3 class="text-xl font-bold">All Pages</h3>
            </div>
            <div class="divide-y divide-gray-200">
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <xsl:variable name="priority" select="sitemap:priority"/>
                    <xsl:variable name="priorityClass">
                        <xsl:choose>
                            <xsl:when test="$priority &gt;= 0.8">priority-high</xsl:when>
                            <xsl:when test="$priority &gt;= 0.5">priority-medium</xsl:when>
                            <xsl:otherwise>priority-low</xsl:otherwise>
                        </xsl:choose>
                    </xsl:variable>
                    
                    <div class="url-item p-6 hover:bg-gray-50 {$priorityClass}">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div class="flex-1">
                                <h4 class="text-lg font-semibold text-gray-800 mb-2">
                                    <a href="{sitemap:loc}" class="text-green-600 hover:text-green-800 hover:underline" target="_blank">
                                        <i class="fas fa-external-link-alt mr-2 text-sm"></i>
                                        <xsl:choose>
                                            <xsl:when test="contains(sitemap:loc, '/index.html') or substring(sitemap:loc, string-length(sitemap:loc)) = '/'">Home Page</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/about.html')">About Us</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/contact.html')">Contact Us</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/team.html')">Our Team</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/blog.html')">Blog</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/news.html')">News</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/donate.html')">Donate</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/volunteer.html')">Volunteer</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/programs.html')">Programs</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/project.html')">Projects</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/gallery.html')">Gallery</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/tree-plantation.html')">Tree Plantation</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/login.html')">Login</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/privacy.html')">Privacy Policy</xsl:when>
                                            <xsl:when test="contains(sitemap:loc, '/terms.html')">Terms of Service</xsl:when>
                                            <xsl:otherwise>
                                                <xsl:value-of select="substring-after(substring-before(sitemap:loc, '.html'), '/')"/>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </a>
                                </h4>
                                <p class="text-sm text-gray-500 break-all"><xsl:value-of select="sitemap:loc"/></p>
                            </div>
                            <div class="mt-4 md:mt-0 md:ml-6 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
                                <div class="text-center">
                                    <span class="text-xs text-gray-500 block">Priority</span>
                                    <span class="font-semibold">
                                        <xsl:choose>
                                            <xsl:when test="$priority &gt;= 0.8">
                                                <span class="text-green-600"><xsl:value-of select="sitemap:priority"/></span>
                                            </xsl:when>
                                            <xsl:when test="$priority &gt;= 0.5">
                                                <span class="text-yellow-600"><xsl:value-of select="sitemap:priority"/></span>
                                            </xsl:when>
                                            <xsl:otherwise>
                                                <span class="text-gray-600"><xsl:value-of select="sitemap:priority"/></span>
                                            </xsl:otherwise>
                                        </xsl:choose>
                                    </span>
                                </div>
                                <div class="text-center">
                                    <span class="text-xs text-gray-500 block">Change Freq</span>
                                    <span class="text-sm font-medium text-gray-700"><xsl:value-of select="sitemap:changefreq"/></span>
                                </div>
                                <div class="text-center">
                                    <span class="text-xs text-gray-500 block">Last Modified</span>
                                    <span class="text-sm font-medium text-gray-700"><xsl:value-of select="sitemap:lastmod"/></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </xsl:for-each>
            </div>
        </div>

        <!-- Footer Info -->
        <div class="mt-8 bg-gray-100 rounded-lg p-6 text-center">
            <p class="text-gray-600">
                <i class="fas fa-info-circle mr-2"></i>
                This sitemap was generated for <strong>JivanJyoti Foundation</strong> to help search engines crawl and index our website effectively.
            </p>
            <p class="text-sm text-gray-500 mt-2">
                For more information, visit our <a href="/" class="text-green-600 hover:underline">homepage</a> or <a href="/contact.html" class="text-green-600 hover:underline">contact us</a>.
            </p>
        </div>
    </main>
</body>
</html>
</xsl:template>
</xsl:stylesheet>