import { 
  PresentationIcon, 
  BarChartIcon, 
  LineChartIcon, 
  PieChartIcon,
  TruckIcon, 
  StoreIcon, 
  HammerIcon, 
  UserCogIcon,
  ComputerIcon, 
  WalletIcon, 
  FileTextIcon,
  FileIcon,
  FolderIcon,
  DownloadIcon, 
  MessageSquareIcon,
  CalendarIcon,
  UserCheckIcon,
  TagIcon,
  RecycleIcon,
  SettingsIcon
} from "lucide-react";
import { LuRecycle } from "react-icons/lu";
import { RiFileTextLine, RiPresentationLine, RiFundsLine, RiTruckLine, RiStore2Line, RiHammerLine, RiUserSettingsLine, RiComputerLine, RiSafeLine, RiBarChartGroupedLine, RiRecycleLine, RiServiceLine, RiFileListLine, RiFilePaperLine, RiFilePaper2Line, RiFileCodeLine, RiFileChartLine, RiFileExcelLine, RiFileWordLine, RiFilePptLine, RiFilePdfLine, RiFolderLine, RiFolder5Line, RiPieChartLine, RiBarChartLine, RiLineChartLine, RiDownloadLine, RiChat1Line, RiSendPlaneFill } from "react-icons/ri";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<any>> = {
  // Lucide icons
  "presentation": PresentationIcon,
  "bar-chart": BarChartIcon,
  "line-chart": LineChartIcon,
  "pie-chart": PieChartIcon,
  "truck": TruckIcon,
  "store": StoreIcon,
  "hammer": HammerIcon,
  "user-cog": UserCogIcon,
  "computer": ComputerIcon,
  "wallet": WalletIcon,
  "file-text": FileTextIcon,
  "file": FileIcon,
  "folder": FolderIcon,
  "download": DownloadIcon,
  "message-square": MessageSquareIcon,
  "calendar": CalendarIcon,
  "user-check": UserCheckIcon,
  "tag": TagIcon,
  "recycle": RecycleIcon,
  "settings": SettingsIcon,
  
  // Remix icons (from ri- prefix)
  "presentation-line": RiPresentationLine,
  "funds-line": RiFundsLine,
  "truck-line": RiTruckLine,
  "store-2-line": RiStore2Line,
  "hammer-line": RiHammerLine,
  "user-settings-line": RiUserSettingsLine,
  "computer-line": RiComputerLine,
  "safe-line": RiSafeLine,
  "bar-chart-grouped-line": RiBarChartGroupedLine,
  "recycle-line": RiRecycleLine,
  "service-line": RiServiceLine,
  "file-text-line": RiFileTextLine,
  "file-list-line": RiFileListLine,
  "file-paper-line": RiFilePaperLine,
  "file-paper-2-line": RiFilePaper2Line,
  "file-code-line": RiFileCodeLine,
  "file-chart-line": RiFileChartLine,
  "file-excel-line": RiFileExcelLine,
  "file-word-line": RiFileWordLine,
  "file-ppt-line": RiFilePptLine,
  "file-pdf-line": RiFilePdfLine,
  "folder-line": RiFolderLine,
  "folder-5-line": RiFolder5Line,
  "pie-chart-line": RiPieChartLine,
  "bar-chart-line": RiBarChartLine,
  "line-chart-line": RiLineChartLine,
  "download-line": RiDownloadLine,
  "chat-1-line": RiChat1Line,
  "send-plane-fill": RiSendPlaneFill,
  
  // React-icons/lu
  "bar-chart-horizontal": BarChartIcon,
  "lu-recycle": LuRecycle
};

/**
 * Get a React component for the specified icon name
 * @param iconName the name of the icon to get
 * @returns React component for the icon or null if not found
 */
export function getIconComponent(iconName: string): React.ComponentType<any> | null {
  const component = iconMap[iconName];
  if (!component) {
    console.warn(`Icon component not found for: ${iconName}`);
    return null;
  }
  return component;
}

/**
 * Convert an icon name to a CSS class to be used with icon fonts
 * (for backward compatibility with design that uses icon fonts)
 * @param iconName the name of the icon
 * @returns CSS class for the icon
 */
export function getIconClass(iconName: string): string {
  // This is a fallback for when we're using CSS classes instead of React components
  // for example with Remix icon font
  return `i-${iconName}`;
}
